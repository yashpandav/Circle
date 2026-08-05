import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Assignment as AssignmentIcon,
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    DeleteOutline as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    AccessTime as AccessTimeIcon,
    CheckCircle as CheckCircleIcon,
    ErrorOutline as ErrorOutlineIcon,
    PeopleAlt as PeopleAltIcon,
    AttachFile as AttachFileIcon,
    OpenInNew as OpenInNewIcon,
    DescriptionOutlined as DescriptionIcon,
    Grade as GradeIcon,
    Cancel as CancelIcon
} from "@mui/icons-material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import {
    Button,
    CircularProgress,
    Tabs,
    Tab,
    Chip,
    Avatar
} from "@mui/material";
import {
    getAssignmentDetails,
    submitAssignment,
    editSubmittedAssignment,
    deleteSubmittedAssignment,
    deleteAssignment
} from '../../../Api/apiCaller/assignmentapicaller';
import { createComment, deleteComment, editComment } from '../../../Api/apiCaller/commentapicaller';
import { updateCurrClass } from '../../../Slices/classSlice';
import socket from '../../../socket/socket';
import ConfirmationDialog from '../../Helper/ConfirmationDialog';
import EditAssignmentModal from '../MainCircleWorkingArea/EditAssignmentModal';
import GradeSubmissionModal from '../../Helper/GradeSubmissionModal';
import { CommentController, AddCommentController } from '../MainCircleWorkingArea/commentController';
import toast from 'react-hot-toast';
import './AssignmentDetails.css';

export default function AssignmentDetails() {
    const { assignmentId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currClass = useSelector((state) => state.classes.currClass);
    const currUser = useSelector((state) => state.auth.user);

    const [assignment, setAssignment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState([]);

    // Student Submission State
    const [selectedFile, setSelectedFile] = useState(null);
    const [studentNote, setStudentNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUnsubmitting, setIsUnsubmitting] = useState(false);
    const [showOverwriteModal, setShowOverwriteModal] = useState(false);
    const [showUnsubmitConfirm, setShowUnsubmitConfirm] = useState(false);

    // Student Edit Submission State
    const [isEditingSubmission, setIsEditingSubmission] = useState(false);
    const [editNote, setEditNote] = useState("");
    const [editFile, setEditFile] = useState(null);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Teacher Management State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [teacherFilterTab, setTeacherFilterTab] = useState(0); // 0: All, 1: Turned in, 2: Assigned

    // Teacher Grading Modal State
    const [gradingModal, setGradingModal] = useState({
        open: false,
        submission: null
    });

    const themeColor = currClass?.classTheme || '#00a896';

    // Fetch Full Assignment Details
    const fetchDetails = useCallback(async () => {
        if (!assignmentId) return;
        try {
            const res = await dispatch(getAssignmentDetails(assignmentId)).unwrap();
            if (res && res.data) {
                setAssignment(res.data);
                setComments(res.data.comment || []);
            }
        } catch (err) {
            console.error("Error fetching assignment details:", err);
            if (currClass?.addedAssignment) {
                const found = currClass.addedAssignment.find(a => (a._id === assignmentId || a === assignmentId));
                if (found && typeof found === 'object') {
                    setAssignment(found);
                    setComments(found.comment || []);
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, [assignmentId, currClass?.addedAssignment, dispatch]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    // Determine Teacher / Admin Authorization safely via useMemo
    const isTeacher = useMemo(() => {
        if (!currUser) return false;
        const userId = (currUser._id || currUser.id)?.toString();
        if (!userId) return false;

        // 1. Is assignment teacher?
        if (assignment?.teacher) {
            const assTeacherId = (assignment.teacher._id || assignment.teacher)?.toString();
            if (assTeacherId === userId) return true;
        }

        // 2. Is class admin?
        if (currClass?.admin) {
            const adminId = (currClass.admin._id || currClass.admin)?.toString();
            if (adminId === userId) return true;
        }

        // 3. Is in class teacher list?
        if (currClass?.teacher && Array.isArray(currClass.teacher)) {
            const inTeacherList = currClass.teacher.some(t => {
                const tId = (t?._id || t?.id || t)?.toString();
                return tId === userId;
            });
            if (inTeacherList) return true;
        }

        return false;
    }, [currUser, assignment, currClass]);

    // Socket.IO Listeners for Live Updates
    useEffect(() => {
        const handleAssignmentUpdated = ({ data }) => {
            if (data && (data._id === assignmentId || data.id === assignmentId)) {
                setAssignment(prev => ({ ...prev, ...data }));
            }
        };

        const handleAssignmentSubmitted = ({ data }) => {
            if (data && (data.assignmentId === assignmentId || data.assignment?._id === assignmentId)) {
                fetchDetails();
            }
        };

        const handleSubmissionDeleted = ({ assId }) => {
            if (assId === assignmentId) {
                fetchDetails();
            }
        };

        const handleSubmissionUpdated = (payload) => {
            if (payload && (payload.assId === assignmentId || payload.data?.assignment === assignmentId)) {
                fetchDetails();
            }
        };

        const handleAssignmentGraded = ({ data }) => {
            if (data && (data.assignmentId === assignmentId || data.assignment === assignmentId)) {
                fetchDetails();
            }
        };

        const handleNewComment = ({ data, parentId }) => {
            if (parentId === assignmentId) {
                setComments(prev => {
                    if (prev.some(c => c._id === data._id)) return prev;
                    return [...prev, data];
                });
            }
        };

        const handleDeletedComment = ({ commentId, parentId }) => {
            if (parentId === assignmentId) {
                setComments(prev => prev.filter(c => c._id !== commentId));
            }
        };

        const handleUpdatedComment = ({ data, parentId }) => {
            if (parentId === assignmentId) {
                setComments(prev => prev.map(c => c._id === data._id ? { ...c, commentBody: data.commentBody } : c));
            }
        };

        socket.on('assignment:updated', handleAssignmentUpdated);
        socket.on('assignment:submitted', handleAssignmentSubmitted);
        socket.on('assignment:submission_updated', handleSubmissionUpdated);
        socket.on('assignment:submission_deleted', handleSubmissionDeleted);
        socket.on('assignment:graded', handleAssignmentGraded);
        socket.on('comment:new', handleNewComment);
        socket.on('comment:deleted', handleDeletedComment);
        socket.on('comment:updated', handleUpdatedComment);

        return () => {
            socket.off('assignment:updated', handleAssignmentUpdated);
            socket.off('assignment:submitted', handleAssignmentSubmitted);
            socket.off('assignment:submission_updated', handleSubmissionUpdated);
            socket.off('assignment:submission_deleted', handleSubmissionDeleted);
            socket.off('assignment:graded', handleAssignmentGraded);
            socket.off('comment:new', handleNewComment);
            socket.off('comment:deleted', handleDeletedComment);
            socket.off('comment:updated', handleUpdatedComment);
        };
    }, [assignmentId, fetchDetails]);

    // Check if the current student has already submitted
    const userSubmission = useMemo(() => {
        if (!assignment?.submission || !currUser) return null;
        const userId = (currUser._id || currUser.id)?.toString();
        return assignment.submission.find(s => {
            const studentId = (s?.student?._id || s?.student?.id || s?.student || s)?.toString();
            return studentId === userId;
        });
    }, [assignment?.submission, currUser]);

    const isSubmitted = Boolean(userSubmission);
    const isPastDue = assignment?.dueDate ? new Date(assignment.dueDate).getTime() < Date.now() : false;
    const canSubmitLate = assignment?.acceptAfterDue ?? true;
    const isGradedAccepted = userSubmission?.status === 'ACCEPTED';
    const isGradedRejected = userSubmission?.status === 'REJECTED';

    // Student Turn-in Handler
    const handleTurnIn = async (overwrite = false) => {
        if (!selectedFile && !studentNote.trim()) {
            toast.error("Please attach a file or write a note to turn in");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await dispatch(submitAssignment({
                assId: assignmentId,
                file: selectedFile,
                data: studentNote.trim(),
                submittedID: userSubmission?._id,
                overwrite: overwrite,
                onOverwritePrompt: () => {
                    setShowOverwriteModal(true);
                }
            })).unwrap();

            if (res?.success) {
                setSelectedFile(null);
                setStudentNote("");
                setShowOverwriteModal(false);
                fetchDetails();
            }
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Student Unsubmit Handler
    const handleUnsubmit = async () => {
        if (isGradedAccepted) return;
        if (!userSubmission?._id && !assignmentId) return;
        setIsUnsubmitting(true);
        try {
            await dispatch(deleteSubmittedAssignment({
                assId: assignmentId,
                submittedID: userSubmission?._id
            })).unwrap();
            setShowUnsubmitConfirm(false);
            setIsEditingSubmission(false);
            fetchDetails();
        } catch (err) {
            console.error("Unsubmit error:", err);
        } finally {
            setIsUnsubmitting(false);
        }
    };

    // Student Edit Submission Handlers
    const handleStartEditSubmission = () => {
        if (isGradedAccepted) return;
        setEditNote(userSubmission?.data || "");
        setEditFile(null);
        setIsEditingSubmission(true);
    };

    const handleCancelEditSubmission = () => {
        setIsEditingSubmission(false);
        setEditNote("");
        setEditFile(null);
    };

    const handleSaveEditSubmission = async () => {
        if (!userSubmission?._id) return;
        setIsSavingEdit(true);
        try {
            const res = await dispatch(editSubmittedAssignment({
                assId: assignmentId,
                submittedID: userSubmission._id,
                data: editNote.trim(),
                file: editFile
            })).unwrap();

            if (res?.success) {
                setIsEditingSubmission(false);
                setEditFile(null);
                setEditNote("");
                fetchDetails();
            }
        } catch (err) {
            console.error("Error updating submission:", err);
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Teacher Delete Assignment Handler
    const handleDeleteAssignment = async () => {
        try {
            const resultAction = await dispatch(deleteAssignment(assignmentId));
            if (deleteAssignment.fulfilled.match(resultAction)) {
                if (currClass?.addedAssignment) {
                    const updatedAssignments = currClass.addedAssignment.filter(
                        (a) => (a._id || a) !== assignmentId
                    );
                    dispatch(updateCurrClass({ addedAssignment: updatedAssignments }));
                }
                navigate(`/workarea/circle/${currClass._id}/stream`);
            }
        } catch (err) {
            console.error("Failed to delete assignment:", err);
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    // Comments Handlers
    const handleAddComment = async (text) => {
        const data = {
            commentBody: text,
            commentOn: "Assignment",
            id: assignmentId,
        };
        try {
            const response = await dispatch(createComment(data));
            if (response && response.data) {
                setComments(prev => [...prev, response.data]);
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const data = {
                commentOn: "Assignment",
                id: assignmentId,
            };
            const response = await dispatch(deleteComment(commentId, data));
            if (response && response.success) {
                setComments(prev => prev.filter(c => c._id !== commentId));
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleEditComment = async (commentId, newText) => {
        try {
            const data = {
                commentBody: newText,
                commentOn: "Assignment",
                id: assignmentId,
            };
            const response = await dispatch(editComment(commentId, data));
            if (response && response.success) {
                setComments(prev => prev.map(c => c._id === commentId ? { ...c, commentBody: newText } : c));
            }
        } catch (error) {
            console.error("Error editing comment:", error);
        }
    };

    const handleOpenGradingModal = (sub) => {
        setGradingModal({
            open: true,
            submission: sub
        });
    };

    const handleGradeModalClosed = () => {
        setGradingModal({
            open: false,
            submission: null
        });
    };

    const handleGradeSaved = () => {
        fetchDetails();
    };

    if (isLoading) {
        return (
            <div className="assignment-details-loading-container">
                <CircularProgress size={36} sx={{ color: themeColor }} />
                <p>Loading assignment...</p>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="assignment-not-found-container">
                <ErrorOutlineIcon sx={{ fontSize: 50, color: '#ef4444' }} />
                <h2>Assignment Not Found</h2>
                <p>The requested assignment might have been deleted or is unavailable.</p>
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/workarea/circle/${currClass?._id || ''}/stream`)}
                    sx={{ backgroundColor: themeColor, textTransform: 'none', borderRadius: '8px' }}
                >
                    Back to Stream
                </Button>
            </div>
        );
    }

    // Teacher Student Submissions Lists
    const submissionsList = assignment.submission || [];
    const pendingStudentsList = assignment.pendingStudent || [];
    const totalAssignedCount = submissionsList.length + pendingStudentsList.length;

    return (
        <div className="assignment-page" style={{ '--class-theme': themeColor }}>
            {/* Top Navigation Row */}
            <div className="assignment-top-nav">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/workarea/circle/${currClass?._id || ''}/stream`)}
                    className="assignment-back-btn"
                    sx={{ color: '#475569', textTransform: 'none', fontWeight: 500, borderRadius: '8px' }}
                >
                    Back to Stream
                </Button>

                {isTeacher && (
                    <div className="assignment-teacher-actions">
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => setIsEditModalOpen(true)}
                            sx={{
                                borderColor: '#dadce0',
                                color: '#3c4043',
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontWeight: 500,
                                '&:hover': { borderColor: themeColor, color: themeColor, backgroundColor: '#f8fafc' }
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon fontSize="small" />}
                            onClick={() => setShowDeleteConfirm(true)}
                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500 }}
                        >
                            Delete
                        </Button>
                    </div>
                )}
            </div>

            <div className="assignment-content-grid">
                {/* Main Left Column: Assignment Details, Instructions, Attachments & Comments */}
                <div className="assignment-main-column">
                    <div className="assignment-unified-card">
                        {/* Header Section */}
                        <div className="assignment-card-header">
                            <div className="assignment-header-icon" style={{ backgroundColor: themeColor }}>
                                <AssignmentIcon />
                            </div>

                            <div className="assignment-header-text">
                                <h1 className="assignment-title">{assignment.name}</h1>
                                <div className="assignment-meta-row">
                                    <span className="assignment-author">
                                        {assignment.teacher?.firstName || "Teacher"} {assignment.teacher?.lastName || ""}
                                    </span>
                                    <span className="assignment-meta-bullet">•</span>
                                    <span className="assignment-date">
                                        Posted {new Date(assignment.uploadDate || Date.now()).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                                    </span>
                                    {assignment.totalMarks && (
                                        <>
                                            <span className="assignment-meta-bullet">•</span>
                                            <span className="assignment-points-meta" style={{ fontWeight: 600, color: themeColor }}>
                                                {assignment.totalMarks} points
                                            </span>
                                        </>
                                    )}
                                    {assignment.category && (
                                        <>
                                            <span className="assignment-meta-bullet">•</span>
                                            <Chip
                                                label={assignment.category.name || assignment.category}
                                                size="small"
                                                className="assignment-topic-chip"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Due Date Indicator on Top Right */}
                            <div className="assignment-header-due">
                                {assignment.dueDate ? (
                                    <div className={`assignment-due-text ${isPastDue ? 'is-overdue' : ''}`}>
                                        <AccessTimeIcon fontSize="small" />
                                        <span>
                                            Due {new Date(assignment.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="assignment-due-text">
                                        <span>No due date</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instructions Body */}
                        <div className="assignment-body-section">
                            <div
                                className="assignment-instructions-text"
                                dangerouslySetInnerHTML={{ __html: assignment.description || "<p>No instructions provided.</p>" }}
                            />

                            {/* Reference Material Attachment */}
                            {assignment.file && (
                                <div className="assignment-reference-wrap">
                                    <h4 className="assignment-reference-title">Reference Material</h4>
                                    <a
                                        href={assignment.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="assignment-attachment-item"
                                    >
                                        <div className="attachment-icon-box">
                                            <PictureAsPdfRoundedIcon sx={{ color: '#ea4335', fontSize: 26 }} />
                                        </div>
                                        <div className="attachment-details">
                                            <span className="attachment-name">
                                                {assignment.file.split('/').pop() || "Reference Document"}
                                            </span>
                                            <span className="attachment-sub">Click to view material</span>
                                        </div>
                                        <OpenInNewIcon fontSize="small" className="attachment-link-icon" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Class Comments Section */}
                        <div className="assignment-comments-section">
                            <div className="assignment-comments-header">
                                <PeopleAltIcon fontSize="small" style={{ color: themeColor }} />
                                <h3>Class Comments ({comments.length})</h3>
                            </div>
                            <CommentController
                                comments={comments}
                                onDeleteComment={handleDeleteComment}
                                onDeleteComment_error={handleDeleteComment}
                                onEditComment={handleEditComment}
                            />
                            <AddCommentController addComment={handleAddComment} />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Student Submission / Teacher Submissions Dashboard */}
                <div className="assignment-sidebar-column">
                    {!isTeacher ? (
                        /* ==============================================================
                           STUDENT VIEW: YOUR WORK CARD & GRADING FEEDBACK
                           ============================================================== */
                        <div className="assignment-side-card student-work-panel">
                            <div className="side-card-header">
                                <h2 className="side-card-title">Your work</h2>
                                <span className={`submission-badge ${
                                    isGradedAccepted
                                        ? 'badge-done'
                                        : isGradedRejected
                                        ? 'badge-missing'
                                        : isSubmitted
                                        ? (isPastDue ? 'badge-late' : 'badge-done')
                                        : (isPastDue ? 'badge-missing' : 'badge-assigned')
                                }`}>
                                    {isGradedAccepted
                                        ? "Graded"
                                        : isGradedRejected
                                        ? "Needs revision"
                                        : isSubmitted
                                        ? (isPastDue ? "Turned in late" : "Turned in")
                                        : (isPastDue ? "Missing" : "Assigned")}
                                </span>
                            </div>

                            {/* Teacher Grade Scorecard (When Accepted) */}
                            {isGradedAccepted && (
                                <div className="student-grade-card">
                                    <div className="grade-card-top">
                                        <span className="grade-card-label">Grade Awarded</span>
                                        <div className="grade-score-display">
                                            <span>{userSubmission.marks}</span>
                                            <span className="grade-score-max">/ {assignment.totalMarks || userSubmission.maxMarks || 100} pts</span>
                                        </div>
                                    </div>
                                    {userSubmission.feedback && (
                                        <div className="teacher-feedback-card">
                                            <span className="feedback-title">Teacher's Feedback:</span>
                                            <p className="feedback-body">"{userSubmission.feedback}"</p>
                                        </div>
                                    )}
                                    {userSubmission.reviewedBy && (
                                        <span className="reviewed-by-tag">
                                            Reviewed by {userSubmission.reviewedBy.firstName || 'Teacher'} {userSubmission.reviewedBy.lastName || ''}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Rejection Alert Banner (When Rejected) */}
                            {isGradedRejected && (
                                <div className="student-rejected-banner">
                                    <div className="rejection-header">
                                        <CancelIcon fontSize="small" />
                                        <span>Submission Returned</span>
                                    </div>
                                    {userSubmission.feedback ? (
                                        <p className="rejection-msg"><strong>Feedback:</strong> {userSubmission.feedback}</p>
                                    ) : (
                                        <p className="rejection-msg">Your submission was returned for revision. Please review your work and resubmit.</p>
                                    )}
                                </div>
                            )}

                            {isSubmitted ? (
                                /* SUBMITTED STATE */
                                <div className="student-submitted-container">
                                    <div className="student-submitted-badge">
                                        <CheckCircleIcon sx={{ color: themeColor, fontSize: 20 }} />
                                        <div>
                                            <strong>Turned in</strong>
                                            <span>
                                                {new Date(userSubmission.submitDate || Date.now()).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    </div>

                                    {!isEditingSubmission ? (
                                        <>
                                            {userSubmission.file && (
                                                <a
                                                    href={userSubmission.file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="student-submitted-file"
                                                >
                                                    <DescriptionIcon sx={{ color: themeColor, fontSize: 20 }} />
                                                    <span className="file-title">
                                                        {userSubmission.file.split('/').pop() || "Submitted Attachment"}
                                                    </span>
                                                    <OpenInNewIcon fontSize="small" className="ext-icon" />
                                                </a>
                                            )}

                                            {userSubmission.data && (
                                                <div className="student-private-note-display">
                                                    <span className="note-title">Private Comment</span>
                                                    <p>{userSubmission.data}</p>
                                                </div>
                                            )}

                                            {!isGradedAccepted && (
                                                <div className="student-action-btn-group">
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => setShowUnsubmitConfirm(true)}
                                                        disabled={isUnsubmitting || (isPastDue && !canSubmitLate)}
                                                        className="student-unsubmit-btn"
                                                        fullWidth
                                                    >
                                                        {isUnsubmitting ? <CircularProgress size={18} /> : "Unsubmit"}
                                                    </Button>
                                                    <Button
                                                        variant="text"
                                                        onClick={handleStartEditSubmission}
                                                        disabled={isPastDue && !canSubmitLate}
                                                        className="student-edit-btn"
                                                        style={{ color: themeColor }}
                                                    >
                                                        {isGradedRejected ? "Resubmit / Edit Work" : "Edit Submission"}
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        /* EDIT SUBMISSION FORM */
                                        <div className="student-edit-form">
                                            {userSubmission.file && !editFile && (
                                                <div className="edit-current-file">
                                                    <AttachFileIcon fontSize="small" sx={{ color: themeColor }} />
                                                    <span>Current: {userSubmission.file.split('/').pop()}</span>
                                                </div>
                                            )}

                                            {editFile ? (
                                                <div className="selected-file-chip">
                                                    <AttachFileIcon sx={{ color: themeColor, fontSize: 18 }} />
                                                    <span className="filename">{editFile.name}</span>
                                                    <button type="button" onClick={() => setEditFile(null)} className="chip-remove">✕</button>
                                                </div>
                                            ) : (
                                                <label className="upload-drop-zone">
                                                    <CloudUploadIcon sx={{ color: themeColor, fontSize: 22 }} />
                                                    <span>{userSubmission.file ? "Replace attached file" : "Attach file"}</span>
                                                    <input
                                                        type="file"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => {
                                                             if (e.target.files?.[0]) setEditFile(e.target.files[0]);
                                                        }}
                                                    />
                                                </label>
                                            )}

                                            <textarea
                                                placeholder="Private comment to teacher..."
                                                value={editNote}
                                                onChange={(e) => setEditNote(e.target.value)}
                                                className="private-comment-input"
                                                rows={2}
                                            />

                                            <div className="edit-btn-row">
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={handleCancelEditSubmission}
                                                    disabled={isSavingEdit}
                                                    className="btn-cancel"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={handleSaveEditSubmission}
                                                    disabled={isSavingEdit}
                                                    className="btn-save"
                                                    style={{ backgroundColor: themeColor }}
                                                >
                                                    {isSavingEdit ? <CircularProgress size={16} color="inherit" /> : (isGradedRejected ? "Resubmit" : "Save")}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* NOT SUBMITTED STATE */
                                <div className="student-unsubmitted-container">
                                    {isPastDue && !canSubmitLate ? (
                                        <div className="submission-closed-box">
                                            <ErrorOutlineIcon sx={{ color: '#d93025', fontSize: 22 }} />
                                            <p>Submissions are closed for this assignment.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Attached file selector */}
                                            {selectedFile ? (
                                                <div className="selected-file-chip">
                                                    <AttachFileIcon sx={{ color: themeColor, fontSize: 18 }} />
                                                    <span className="filename">{selectedFile.name}</span>
                                                    <button type="button" onClick={() => setSelectedFile(null)} className="chip-remove">✕</button>
                                                </div>
                                            ) : (
                                                <label className="upload-drop-zone">
                                                    <CloudUploadIcon sx={{ color: themeColor, fontSize: 24 }} />
                                                    <span className="drop-title">+ Add or create</span>
                                                    <span className="drop-sub">Attach file or document</span>
                                                    <input
                                                        type="file"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                                                        }}
                                                    />
                                                </label>
                                            )}

                                            {/* Private Note / Comment */}
                                            <textarea
                                                placeholder="Add private comment to teacher..."
                                                value={studentNote}
                                                onChange={(e) => setStudentNote(e.target.value)}
                                                className="private-comment-input"
                                                rows={2}
                                            />

                                            {/* Turn In Button */}
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                disabled={isSubmitting || (!selectedFile && !studentNote.trim())}
                                                onClick={() => handleTurnIn(false)}
                                                className="turn-in-btn"
                                                style={{ backgroundColor: themeColor }}
                                            >
                                                {isSubmitting ? (
                                                    <CircularProgress size={18} color="inherit" />
                                                ) : isPastDue ? (
                                                    "Turn in late"
                                                ) : (
                                                    "Turn in"
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ==============================================================
                           TEACHER VIEW: STUDENT WORK & SUBMISSIONS DASHBOARD
                           ============================================================== */
                        <div className="assignment-side-card teacher-work-panel">
                            <div className="side-card-header">
                                <h2 className="side-card-title">Student work</h2>
                            </div>

                            {/* Summary Metrics */}
                            <div className="teacher-metrics-row">
                                <div className="metric-box">
                                    <span className="metric-num" style={{ color: themeColor }}>
                                        {submissionsList.length}
                                    </span>
                                    <span className="metric-lbl">Turned in</span>
                                </div>
                                <div className="metric-box">
                                    <span className="metric-num" style={{ color: '#5f6368' }}>
                                        {pendingStudentsList.length}
                                    </span>
                                    <span className="metric-lbl">Assigned</span>
                                </div>
                            </div>

                            <Button
                                variant="outlined"
                                fullWidth
                                size="small"
                                onClick={() => navigate(`/workarea/review?assId=${assignment._id}`)}
                                className="teacher-open-review-btn"
                                style={{ borderColor: '#dadce0', color: themeColor }}
                            >
                                Open Full Review List
                            </Button>

                            {/* Filter Tabs */}
                            <div className="teacher-tabs-wrap">
                                <Tabs
                                    value={teacherFilterTab}
                                    onChange={(e, val) => setTeacherFilterTab(val)}
                                    variant="fullWidth"
                                    className="teacher-filter-tabs"
                                    sx={{
                                        minHeight: '36px',
                                        '& .MuiTabs-indicator': { backgroundColor: themeColor }
                                    }}
                                >
                                    <Tab label={`All (${totalAssignedCount})`} sx={{ textTransform: 'none', fontSize: '13px', minHeight: '36px', fontWeight: 500 }} />
                                    <Tab label={`Turned in (${submissionsList.length})`} sx={{ textTransform: 'none', fontSize: '13px', minHeight: '36px', fontWeight: 500 }} />
                                    <Tab label={`Assigned (${pendingStudentsList.length})`} sx={{ textTransform: 'none', fontSize: '13px', minHeight: '36px', fontWeight: 500 }} />
                                </Tabs>

                                {/* Student Submissions List */}
                                <div className="teacher-students-list">
                                    {/* Turned in Students */}
                                    {(teacherFilterTab === 0 || teacherFilterTab === 1) &&
                                        submissionsList.map((sub) => {
                                            const student = sub.student;
                                            const studentName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : "Student";
                                            const isAccepted = sub.status === 'ACCEPTED';
                                            const isRejected = sub.status === 'REJECTED';
                                            const maxPts = assignment.totalMarks || sub.maxMarks || 100;

                                            return (
                                                <div key={sub._id} className="teacher-student-item is-turned-in">
                                                    <Avatar
                                                        src={student?.image}
                                                        alt={studentName}
                                                        sx={{ width: 32, height: 32, fontSize: '13px', backgroundColor: themeColor }}
                                                    >
                                                        {studentName[0]}
                                                    </Avatar>
                                                    <div className="student-details">
                                                        <div className="student-name-row">
                                                            <span className="student-name" title={studentName}>{studentName}</span>
                                                            <span
                                                                className="turned-in-badge"
                                                                style={{
                                                                    color: isAccepted ? '#15803d' : isRejected ? '#b91c1c' : themeColor,
                                                                    backgroundColor: isAccepted ? '#dcfce7' : isRejected ? '#fee2e2' : 'rgba(0, 168, 150, 0.08)'
                                                                }}
                                                            >
                                                                {isAccepted ? 'Accepted' : isRejected ? 'Rejected' : 'Turned in'}
                                                            </span>
                                                        </div>
                                                        <span className="submit-date-text">
                                                            {new Date(sub.submitDate || Date.now()).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                        {sub.file && (
                                                            <a
                                                                href={sub.file}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="student-attachment-link"
                                                                style={{ color: themeColor }}
                                                            >
                                                                <AttachFileIcon fontSize="inherit" /> Attached Work
                                                            </a>
                                                        )}
                                                        {sub.data && <p className="student-note-text">"{sub.data}"</p>}

                                                        {/* Grading Meta & Quick Action */}
                                                        <div className="student-grade-meta-row">
                                                            {isAccepted ? (
                                                                <span className="student-grade-pill">
                                                                    Grade: {sub.marks} / {maxPts}
                                                                </span>
                                                            ) : isRejected ? (
                                                                <span className="student-grade-pill" style={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}>
                                                                    Rejected
                                                                </span>
                                                            ) : (
                                                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                                    Ungraded
                                                                </span>
                                                            )}

                                                            <Button
                                                                size="small"
                                                                variant={isAccepted ? "text" : "contained"}
                                                                startIcon={<GradeIcon fontSize="inherit" />}
                                                                onClick={() => handleOpenGradingModal(sub)}
                                                                className="student-teacher-grade-btn"
                                                                sx={{
                                                                    backgroundColor: isAccepted ? 'transparent' : themeColor,
                                                                    color: isAccepted ? themeColor : '#ffffff',
                                                                    '&:hover': {
                                                                        backgroundColor: isAccepted ? '#f1f5f9' : themeColor,
                                                                        filter: 'brightness(0.92)'
                                                                    }
                                                                }}
                                                            >
                                                                {isAccepted ? 'Edit Grade' : 'Grade'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    {/* Pending Students */}
                                    {(teacherFilterTab === 0 || teacherFilterTab === 2) &&
                                        pendingStudentsList.map((st) => {
                                            const studentName = typeof st === 'object' ? `${st.firstName || ''} ${st.lastName || ''}`.trim() : "Enrolled Student";
                                            const avatarImg = typeof st === 'object' ? st.image : null;
                                            const stKey = typeof st === 'object' ? st._id : st;
                                            return (
                                                <div key={stKey} className="teacher-student-item is-pending">
                                                    <Avatar
                                                        src={avatarImg}
                                                        alt={studentName}
                                                        sx={{ width: 32, height: 32, fontSize: '13px', backgroundColor: '#e2e8f0', color: '#5f6368' }}
                                                    >
                                                        {studentName[0]}
                                                    </Avatar>
                                                    <div className="student-details">
                                                        <div className="student-name-row">
                                                            <span className="student-name" title={studentName}>{studentName}</span>
                                                            <span className={`assigned-badge ${isPastDue ? 'is-missing' : ''}`}>
                                                                {isPastDue ? "Missing" : "Assigned"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    {totalAssignedCount === 0 && (
                                        <div className="teacher-empty-students">
                                            No students currently assigned to this assignment.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Overwrite Submission Dialog */}
            <ConfirmationDialog
                open={showOverwriteModal}
                title="Overwrite Previous Submission?"
                content="You already submitted work for this assignment. Would you like to overwrite it with this new submission?"
                confirmText="Overwrite"
                confirmColor="primary"
                onConfirm={() => handleTurnIn(true)}
                onCancel={() => setShowOverwriteModal(false)}
            />

            {/* Unsubmit Confirmation Dialog */}
            <ConfirmationDialog
                open={showUnsubmitConfirm}
                title="Unsubmit Assignment?"
                content="Are you sure you want to unsubmit? You will need to resubmit before the deadline."
                confirmText="Unsubmit"
                confirmColor="error"
                onConfirm={handleUnsubmit}
                onCancel={() => setShowUnsubmitConfirm(false)}
            />

            {/* Delete Assignment Confirmation Dialog */}
            <ConfirmationDialog
                open={showDeleteConfirm}
                title="Delete Assignment"
                content="Are you sure you want to permanently delete this assignment? All student submissions, grades, and comments will be deleted."
                confirmText="Delete"
                confirmColor="error"
                onConfirm={handleDeleteAssignment}
                onCancel={() => setShowDeleteConfirm(false)}
            />

            {/* Edit Assignment Modal */}
            <EditAssignmentModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                assignment={assignment}
                onAssignmentUpdated={(updated) => {
                    setAssignment(prev => ({ ...prev, ...updated }));
                }}
            />

            {/* Grade Submission Modal */}
            <GradeSubmissionModal
                open={gradingModal.open}
                onClose={handleGradeModalClosed}
                assignment={assignment}
                submission={gradingModal.submission}
                onGraded={handleGradeSaved}
                themeColor={themeColor}
            />
        </div>
    );
}


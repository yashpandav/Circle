import React, { useState, useEffect, useCallback } from 'react';
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
    School as SchoolIcon,
    AttachFile as AttachFileIcon,
    OpenInNew as OpenInNewIcon
} from "@mui/icons-material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import {
    Divider,
    IconButton,
    Button,
    CircularProgress,
    Tabs,
    Tab,
    Chip,
    Avatar,
    Tooltip
} from "@mui/material";
import {
    getAssignmentDetails,
    submitAssignment,
    deleteSubmittedAssignment,
    deleteAssignment
} from '../../../Api/apiCaller/assignmentapicaller';
import { createComment, deleteComment, editComment } from '../../../Api/apiCaller/commentapicaller';
import { updateCurrClass } from '../../../Slices/classSlice';
import socket from '../../../socket/socket';
import ConfirmationDialog from '../../Helper/ConfirmationDialog';
import EditAssignmentModal from '../MainCircleWorkingArea/EditAssignmentModal';
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
    const [isTeacher, setIsTeacher] = useState(false);
    const [comments, setComments] = useState([]);

    // Student Submission State
    const [selectedFile, setSelectedFile] = useState(null);
    const [studentNote, setStudentNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUnsubmitting, setIsUnsubmitting] = useState(false);
    const [showOverwriteModal, setShowOverwriteModal] = useState(false);
    const [showUnsubmitConfirm, setShowUnsubmitConfirm] = useState(false);

    // Teacher Management State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [teacherFilterTab, setTeacherFilterTab] = useState(0); // 0: All, 1: Turned in, 2: Assigned

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
            // Fallback from currClass if available
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

    // Determine Teacher / Admin Authorization
    useEffect(() => {
        if (currUser && assignment) {
            const isOwner = currUser._id === (assignment.teacher?._id || assignment.teacher);
            const isClassAdmin = currClass?.admin && (currClass.admin._id === currUser._id || currClass.admin === currUser._id);
            const isClassTeacher = currClass?.teacher && Array.isArray(currClass.teacher) && currClass.teacher.some(
                t => (t._id === currUser._id || t === currUser._id || t.id === currUser._id)
            );
            setIsTeacher(Boolean(isOwner || isClassAdmin || isClassTeacher));
        }
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
        socket.on('comment:new', handleNewComment);
        socket.on('comment:deleted', handleDeletedComment);
        socket.on('comment:updated', handleUpdatedComment);

        return () => {
            socket.off('assignment:updated', handleAssignmentUpdated);
            socket.off('assignment:submitted', handleAssignmentSubmitted);
            socket.off('assignment:submission_updated', handleSubmissionUpdated);
            socket.off('assignment:submission_deleted', handleSubmissionDeleted);
            socket.off('comment:new', handleNewComment);
            socket.off('comment:deleted', handleDeletedComment);
            socket.off('comment:updated', handleUpdatedComment);
        };
    }, [assignmentId, fetchDetails]);

    // Check if the current student has already submitted
    const userSubmission = assignment?.submission?.find(
        s => (s.student?._id === currUser?._id || s.student === currUser?._id || s === currUser?._id)
    );
    const isSubmitted = Boolean(userSubmission);
    const isPastDue = assignment?.dueDate && new Date(assignment.dueDate).getTime() < Date.now();
    const canSubmitLate = assignment?.acceptAfterDue ?? true;

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
        if (!userSubmission?._id && !assignmentId) return;
        setIsUnsubmitting(true);
        try {
            await dispatch(deleteSubmittedAssignment({
                assId: assignmentId,
                submittedID: userSubmission?._id
            })).unwrap();
            setShowUnsubmitConfirm(false);
            fetchDetails();
        } catch (err) {
            console.error("Unsubmit error:", err);
        } finally {
            setIsUnsubmitting(false);
        }
    };

    // Teacher Delete Assignment Handler
    const handleDeleteAssignment = async () => {
        setIsDeleting(true);
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
            setIsDeleting(false);
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

    if (isLoading) {
        return (
            <div className="assignment-details-loading-container">
                <CircularProgress size={36} sx={{ color: themeColor }} />
                <p>Loading assignment details...</p>
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
        <div className="assignment-details-container">
            {/* Top Navigation Bar */}
            <div className="assignment-details-top-bar">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/workarea/circle/${currClass._id}/stream`)}
                    className="back-btn"
                    sx={{ color: '#475569', textTransform: 'none', fontWeight: 500 }}
                >
                    Back to Stream
                </Button>

                {isTeacher && (
                    <div className="teacher-actions-top">
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => setIsEditModalOpen(true)}
                            sx={{
                                borderColor: '#cbd5e1',
                                color: '#334155',
                                textTransform: 'none',
                                borderRadius: '8px',
                                '&:hover': { borderColor: themeColor, color: themeColor }
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
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                        >
                            Delete
                        </Button>
                    </div>
                )}
            </div>

            <div className="assignment-details-layout">
                {/* Left / Main Content Column */}
                <div className="assignment-details-main">
                    {/* Header Card */}
                    <div className="assignment-hero-card">
                        <div className="hero-top-row">
                            <div className="hero-icon-avatar" style={{ backgroundColor: themeColor }}>
                                <AssignmentIcon />
                            </div>
                            <div className="hero-info">
                                <h1 className="hero-title">{assignment.name}</h1>
                                <div className="hero-meta">
                                    <span className="teacher-name">
                                        {assignment.teacher?.firstName || "Teacher"} {assignment.teacher?.lastName || ""}
                                    </span>
                                    <span className="dot-sep">•</span>
                                    <span className="post-date">
                                        Posted {new Date(assignment.uploadDate || Date.now()).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                                    </span>
                                    {assignment.category && (
                                        <>
                                            <span className="dot-sep">•</span>
                                            <Chip
                                                label={assignment.category.name || assignment.category}
                                                size="small"
                                                className="topic-chip"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Due Date & Late Status Banner */}
                        <div className="hero-due-badge-row">
                            {assignment.dueDate ? (
                                <div className={`due-date-pill ${isPastDue ? 'past-due' : ''}`}>
                                    <AccessTimeIcon fontSize="small" />
                                    <span>
                                        Due {new Date(assignment.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                                    </span>
                                </div>
                            ) : (
                                <div className="due-date-pill">
                                    <AccessTimeIcon fontSize="small" />
                                    <span>No due date</span>
                                </div>
                            )}

                            {isPastDue && (
                                <span className={`late-policy-tag ${canSubmitLate ? 'late-allowed' : 'late-closed'}`}>
                                    {canSubmitLate ? "Late Submissions Allowed" : "Submissions Closed"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Assignment Instructions / Description */}
                    <div className="assignment-instructions-card">
                        <h3 className="section-heading">Instructions</h3>
                        <div
                            className="instructions-content"
                            dangerouslySetInnerHTML={{ __html: assignment.description || "<p>No instructions provided.</p>" }}
                        />

                        {/* Teacher's Reference Attachment */}
                        {assignment.file && (
                            <div className="teacher-reference-attachment">
                                <h4 className="attachment-heading">Reference Material</h4>
                                <a
                                    href={assignment.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="reference-file-card"
                                >
                                    <PictureAsPdfRoundedIcon sx={{ color: '#ef4444', fontSize: 32 }} />
                                    <div className="file-meta">
                                        <span className="file-name">View Reference Material</span>
                                        <span className="file-subtitle">Click to open or download</span>
                                    </div>
                                    <OpenInNewIcon fontSize="small" className="external-link-icon" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Class Comments Section */}
                    <div className="assignment-comments-card">
                        <div className="comments-card-header">
                            <PeopleAltIcon fontSize="small" style={{ color: themeColor }} />
                            <h3>Class Comments ({comments.length})</h3>
                        </div>
                        <CommentController
                            comments={comments}
                            onDeleteComment={handleDeleteComment}
                            onEditComment={handleEditComment}
                        />
                        <AddCommentController addComment={handleAddComment} />
                    </div>
                </div>

                {/* Right Column / Actions & Submissions Panel */}
                <div className="assignment-details-sidebar">
                    {!isTeacher ? (
                        /* STUDENT SUBMISSION WORK CARD */
                        <div className="student-work-card">
                            <div className="work-card-header">
                                <h2>Your Work</h2>
                                <span className={`submission-status-badge ${isSubmitted ? 'status-turned-in' : isPastDue ? 'status-missing' : 'status-assigned'}`}>
                                    {isSubmitted ? (isPastDue ? "Turned in (Late)" : "Turned in") : (isPastDue ? "Missing" : "Assigned")}
                                </span>
                            </div>

                            <Divider sx={{ my: 1.5 }} />

                            {isSubmitted ? (
                                /* SUBMITTED STATE */
                                <div className="submitted-work-view">
                                    <div className="submitted-success-banner">
                                        <CheckCircleIcon sx={{ color: '#10b981' }} />
                                        <div>
                                            <h4>Assignment Handed In</h4>
                                            <p>{new Date(userSubmission.submitDate || Date.now()).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}</p>
                                        </div>
                                    </div>

                                    {userSubmission.file && (
                                        <a
                                            href={userSubmission.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="submitted-file-attachment"
                                        >
                                            <AttachFileIcon sx={{ color: themeColor }} />
                                            <span className="filename">Your Submitted File</span>
                                            <OpenInNewIcon fontSize="small" className="ext-icon" />
                                        </a>
                                    )}

                                    {userSubmission.data && (
                                        <div className="submitted-note-box">
                                            <span className="note-label">Private Note:</span>
                                            <p>{userSubmission.data}</p>
                                        </div>
                                    )}

                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        fullWidth
                                        disabled={isUnsubmitting || (isPastDue && !canSubmitLate)}
                                        onClick={() => setShowUnsubmitConfirm(true)}
                                        className="unsubmit-action-btn"
                                    >
                                        {isUnsubmitting ? <CircularProgress size={20} /> : "Unsubmit"}
                                    </Button>
                                    <p className="unsubmit-hint">Unsubmit to add or change your attachments.</p>
                                </div>
                            ) : (
                                /* NOT SUBMITTED STATE */
                                <div className="unsubmitted-work-form">
                                    {isPastDue && !canSubmitLate ? (
                                        <div className="submissions-closed-notice">
                                            <ErrorOutlineIcon sx={{ color: '#ef4444' }} />
                                            <p>The deadline has passed and the teacher has closed submissions for this assignment.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* File Picker */}
                                            {selectedFile ? (
                                                <div className="selected-upload-card">
                                                    <div className="selected-upload-info">
                                                        <AttachFileIcon sx={{ color: themeColor }} />
                                                        <span className="selected-filename">{selectedFile.name}</span>
                                                    </div>
                                                    <IconButton size="small" onClick={() => setSelectedFile(null)}>
                                                        ✕
                                                    </IconButton>
                                                </div>
                                            ) : (
                                                <label className="upload-file-trigger" style={{ borderColor: themeColor }}>
                                                    <CloudUploadIcon sx={{ color: themeColor, fontSize: 28 }} />
                                                    <span>Add or attach your work</span>
                                                    <span className="subtext">PDF, DOC, Images supported</span>
                                                    <input
                                                        type="file"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                                                        }}
                                                    />
                                                </label>
                                            )}

                                            {/* Student Private Note */}
                                            <textarea
                                                placeholder="Add a private note to teacher (optional)..."
                                                value={studentNote}
                                                onChange={(e) => setStudentNote(e.target.value)}
                                                className="student-note-textarea"
                                                rows={3}
                                            />

                                            {/* Turn In Button */}
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                disabled={isSubmitting || (!selectedFile && !studentNote.trim())}
                                                onClick={() => handleTurnIn(false)}
                                                className="turn-in-action-btn"
                                                style={{ backgroundColor: themeColor }}
                                            >
                                                {isSubmitting ? (
                                                    <CircularProgress size={20} color="inherit" />
                                                ) : isPastDue ? (
                                                    "Turn In Late"
                                                ) : (
                                                    "Turn In"
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* TEACHER SUBMISSIONS & STATS DASHBOARD */
                        <div className="teacher-workspace-panel">
                            {/* Summary Metrics */}
                            <div className="teacher-stats-box">
                                <h3>Student Progress</h3>
                                <div className="stats-row">
                                    <div className="stat-card">
                                        <span className="stat-number" style={{ color: '#10b981' }}>
                                            {submissionsList.length}
                                        </span>
                                        <span className="stat-label">Turned In</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-number" style={{ color: '#64748b' }}>
                                            {pendingStudentsList.length}
                                        </span>
                                        <span className="stat-label">Assigned</span>
                                    </div>
                                </div>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    onClick={() => navigate(`/workarea/review?assId=${assignment._id}`)}
                                    sx={{
                                        mt: 1.5,
                                        borderColor: themeColor,
                                        color: themeColor,
                                        textTransform: 'none',
                                        borderRadius: '8px'
                                    }}
                                >
                                    Open Full Review List
                                </Button>
                            </div>

                            {/* Submissions Filter Tabs */}
                            <div className="teacher-submissions-container">
                                <Tabs
                                    value={teacherFilterTab}
                                    onChange={(e, val) => setTeacherFilterTab(val)}
                                    variant="fullWidth"
                                    className="submission-filter-tabs"
                                    sx={{
                                        minHeight: '38px',
                                        '& .MuiTabs-indicator': { backgroundColor: themeColor }
                                    }}
                                >
                                    <Tab label={`All (${totalAssignedCount})`} sx={{ textTransform: 'none', fontSize: '13px', minHeight: '38px' }} />
                                    <Tab label={`Done (${submissionsList.length})`} sx={{ textTransform: 'none', fontSize: '13px', minHeight: '38px' }} />
                                    <Tab label={`Pending (${pendingStudentsList.length})`} sx={{ textTransform: 'none', fontSize: '13px', minHeight: '38px' }} />
                                </Tabs>

                                <div className="submissions-student-list">
                                    {/* Turned In Students */}
                                    {(teacherFilterTab === 0 || teacherFilterTab === 1) &&
                                        submissionsList.map((sub) => {
                                            const student = sub.student;
                                            const studentName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : "Unknown Student";
                                            return (
                                                <div key={sub._id} className="student-submission-item done">
                                                    <Avatar
                                                        src={student?.image}
                                                        alt={studentName}
                                                        sx={{ width: 34, height: 34 }}
                                                    >
                                                        {studentName[0] || <SchoolIcon />}
                                                    </Avatar>
                                                    <div className="student-item-details">
                                                        <div className="student-item-header">
                                                            <span className="student-name">{studentName}</span>
                                                            <span className="status-pill done">Turned In</span>
                                                        </div>
                                                        <span className="submission-time">
                                                            {new Date(sub.submitDate || Date.now()).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                                                        </span>
                                                        {sub.file && (
                                                            <a
                                                                href={sub.file}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="student-file-link"
                                                            >
                                                                <AttachFileIcon fontSize="inherit" /> Attached Work
                                                            </a>
                                                        )}
                                                        {sub.data && <p className="student-note-preview">"{sub.data}"</p>}
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
                                                <div key={stKey} className="student-submission-item pending">
                                                    <Avatar
                                                        src={avatarImg}
                                                        alt={studentName}
                                                        sx={{ width: 34, height: 34 }}
                                                    >
                                                        {studentName[0] || <SchoolIcon />}
                                                    </Avatar>
                                                    <div className="student-item-details">
                                                        <div className="student-item-header">
                                                            <span className="student-name">{studentName}</span>
                                                            <span className={`status-pill ${isPastDue ? 'missing' : 'assigned'}`}>
                                                                {isPastDue ? "Missing" : "Assigned"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    {totalAssignedCount === 0 && (
                                        <div className="no-students-message">
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
        </div>
    );
}

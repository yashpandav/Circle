import React, { useEffect, useState, useRef } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import { Menu, MenuItem, IconButton, CircularProgress } from "@mui/material";
import { Assignment as AssignmentIcon, LinkRounded as LinkRoundedIcon } from "@mui/icons-material";
import "./postContainer.css";
import "./uploadFile.css";
import { CommentController, AddCommentController } from "./commentController";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createComment, deleteComment, editComment } from "../../../Api/apiCaller/commentapicaller";
import { deleteAssignment } from "../../../Api/apiCaller/assignmentapicaller";
import { updateCurrClass } from "../../../Slices/classSlice";
import socket from "../../../socket/socket";
import ConfirmationDialog from "../../Helper/ConfirmationDialog";
import EditAssignmentModal from "./EditAssignmentModal";

export default function AssignmentContainer({ assignment }) {
    const [comments, setComments] = useState(assignment.comment || []);
    const [anchorEl, setAnchorEl] = useState(null);
    const currUser = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isAnnouncer, setAnnouncer] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Controlled Height & Text Clamping
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef(null);

    const userId = (currUser?._id || currUser?.id)?.toString();
    const assTeacherId = (assignment?.teacher?._id || assignment?.teacher?.id || assignment?.teacher)?.toString();
    const isOwner = Boolean(userId && assTeacherId && userId === assTeacherId);

    const isClassAdmin = Boolean(currClass?.admin && ((currClass.admin._id || currClass.admin)?.toString() === userId));
    const isClassTeacher = Boolean(currClass?.teacher && Array.isArray(currClass.teacher) && currClass.teacher.some(
        t => (t?._id || t?.id || t)?.toString() === userId
    ));
    const isTeacherOrAdmin = Boolean(isOwner || isClassAdmin || isClassTeacher);
    const isStudent = !isTeacherOrAdmin;

    useEffect(() => {
        setAnnouncer(isOwner);
    }, [isOwner]);

    useEffect(() => {
        if (contentRef.current) {
            const hasOverflow = contentRef.current.scrollHeight > 240;
            setIsOverflowing(hasOverflow);
        }
    }, [assignment?.description]);

    useEffect(() => {
        const handleNewComment = ({ data, parentId }) => {
            if (parentId === assignment._id) {
                setComments(prev => {
                    if (prev.some(c => c._id === data._id)) return prev;
                    return [...prev, data];
                });
            }
        };

        const handleDeletedComment = ({ commentId, parentId }) => {
            if (parentId === assignment._id) {
                setComments(prev => prev.filter(c => c._id !== commentId));
            }
        };

        const handleUpdatedComment = ({ data, parentId }) => {
            if (parentId === assignment._id) {
                setComments(prev => prev.map(c => c._id === data._id ? { ...c, commentBody: data.commentBody } : c));
            }
        };

        socket.on('comment:new', handleNewComment);
        socket.on('comment:deleted', handleDeletedComment);
        socket.on('comment:updated', handleUpdatedComment);

        return () => {
            socket.off('comment:new', handleNewComment);
            socket.off('comment:deleted', handleDeletedComment);
            socket.off('comment:updated', handleUpdatedComment);
        };
    }, [assignment._id]);

    const addComment = async (newCommentText) => {
        const data = {
            commentBody: newCommentText,
            commentOn: "Assignment",
            id: assignment._id,
        };
        try {
            const response = await dispatch(createComment(data));
            if (response && response.data) {
                setComments((prevComments) => [...prevComments, response.data]);
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        handleMenuClose();
        setConfirmDelete(true);
    };

    const confirmDeleteAction = async () => {
        setConfirmDelete(false);
        setIsDeleting(true);
        try {
            const resultAction = await dispatch(deleteAssignment(assignment._id));
            if (deleteAssignment.fulfilled.match(resultAction)) {
                if (currClass?.addedAssignment) {
                    const updatedAssignments = currClass.addedAssignment.filter(
                        (a) => (a._id || a) !== assignment._id
                    );
                    dispatch(updateCurrClass({ addedAssignment: updatedAssignments }));
                }
            }
        } catch (err) {
            console.error("Failed to delete assignment", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = () => {
        handleMenuClose();
        setIsEditModalOpen(true);
    };

    if (isDeleting) {
        return (
            <div className="post-container assignment-post-container" style={{ padding: "30px", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress size={28} />
            </div>
        );
    }

    const handleDeleteComment = async (commentId) => {
        try {
            const data = {
                commentOn: "Assignment",
                id: assignment._id,
            };
            const response = await dispatch(deleteComment(commentId, data));
            if (response && response.success) {
                setComments((prevComments) => prevComments.filter((c) => c._id !== commentId));
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
                id: assignment._id,
            };
            const response = await dispatch(editComment(commentId, data));
            if (response && response.success) {
                setComments((prevComments) => prevComments.map((c) => c._id === commentId ? { ...c, commentBody: newText } : c));
            }
        } catch (error) {
            console.error("Error editing comment:", error);
        }
    };

    // Calculate student submission status
    const userSubmission = assignment.submission && Array.isArray(assignment.submission)
        ? assignment.submission.find(s => (s?.student?._id === currUser?._id || s?.student === currUser?._id || s?._id === currUser?._id || s?.student?.id === currUser?._id))
        : null;
    const isSubmitted = Boolean(userSubmission);
    const isPastDue = assignment.dueDate && new Date(assignment.dueDate).getTime() < Date.now();
    const isAccepted = userSubmission?.status === 'ACCEPTED';
    const isRejected = userSubmission?.status === 'REJECTED';

    return (
        <div className="post-container assignment-post-container" key={assignment._id}>
            <div className="post-wrapper">
                <div className="post-header">
                    <div className="left-side-post-details">
                        <div className="post-uploader-image assignment-icon-avatar" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: currClass?.classTheme || '#00a896',
                            color: 'white',
                            borderRadius: '50%'
                        }}>
                            <AssignmentIcon />
                        </div>
                        <div className="post-upload-details" style={{ cursor: 'pointer' }} onClick={() => navigate(`/workarea/circle/${currClass._id}/assignment/${assignment._id}`)}>
                            <h3 className="post-uploader-name">
                                {assignment.teacher?.firstName || "Teacher"} {assignment.teacher?.lastName || ""} posted an assignment
                            </h3>
                            <h6 className="post-upload-date">
                                {new Date(assignment.uploadDate || Date.now())
                                    .toLocaleString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                        hour12: true,
                                    })
                                    .replace(/:\d{2} /, " ")}
                            </h6>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isStudent && (
                            <span style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                padding: '4px 10px',
                                borderRadius: '12px',
                                backgroundColor: isAccepted ? '#e6f4ea' : isRejected ? '#fce8e6' : isSubmitted ? '#e6f4ea' : isPastDue ? '#fce8e6' : '#e8f0fe',
                                color: isAccepted ? '#137333' : isRejected ? '#c5221f' : isSubmitted ? '#137333' : isPastDue ? '#c5221f' : '#1a73e8'
                            }}>
                                {isAccepted ? "Graded" : isRejected ? "Needs revision" : isSubmitted ? "Turned in" : isPastDue ? "Missing" : "Assigned"}
                            </span>
                        )}

                        {isAnnouncer && (
                            <IconButton className="more-vert-icon" onClick={handleMenuOpen}>
                                <MoreVertIcon />
                            </IconButton>
                        )}
                    </div>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem
                            onClick={handleEdit}
                            sx={{
                                fontFamily: "Roboto, Arial, sans-serif",
                                fontSize: "15px",
                                fontWeight: 400,
                                letterSpacing: ".1px",
                                boxSizing: "border-box",
                                width: "120px",
                            }}
                        >
                            Edit
                        </MenuItem>
                        <MenuItem
                            onClick={handleDelete}
                            sx={{
                                fontFamily: "Roboto, Arial, sans-serif",
                                fontSize: "15px",
                                fontWeight: 400,
                                letterSpacing: ".1px",
                                boxSizing: "border-box",
                                width: "120px",
                            }}
                        >
                            Delete
                        </MenuItem>
                    </Menu>
                </div>

                {/* Assignment Title & Due Date */}
                <div className="assignment-body-header" style={{ cursor: 'pointer' }} onClick={() => navigate(`/workarea/circle/${currClass._id}/assignment/${assignment._id}`)}>
                    <h1 className="post-title" style={{ padding: 0 }}>{assignment.name}</h1>
                    {assignment.dueDate && (
                        <div className="assignment-due-badge">
                            Due {new Date(assignment.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                        </div>
                    )}
                </div>

                {/* Clamped Description with Wrapped Content */}
                {assignment.description && (
                    <>
                        <div 
                            ref={contentRef}
                            className={`post-content-wrapper ${isExpanded ? "expanded" : isOverflowing ? "clamped" : ""}`}
                        >
                            <div
                                className="post-content"
                                dangerouslySetInnerHTML={{ __html: assignment.description }}
                            />
                        </div>
                        {isOverflowing && (
                            <button
                                type="button"
                                className="post-read-more-btn"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? (
                                    <>Show less <ExpandLessRoundedIcon fontSize="small" /></>
                                ) : (
                                    <>Read more <ExpandMoreRoundedIcon fontSize="small" /></>
                                )}
                            </button>
                        )}
                    </>
                )}

                {/* Attachments (Files) */}
                {((assignment.files && assignment.files.length > 0) || assignment.file) && (
                    <div className="post-attachments">
                        {assignment.files && assignment.files.length > 0 ? (
                            assignment.files.map((file, idx) => {
                                const isPdf = file.fileType === "pdf" || file.fileUrl?.endsWith(".pdf") || file.fileName?.endsWith(".pdf");
                                const fileName = file.fileName ? (file.fileName.includes("|") ? file.fileName.split("|")[0] + "." + file.fileName.split(".").pop() : file.fileName) : "Attachment";
                                if (isPdf) {
                                    return (
                                        <div className="unsupported-files post-side" key={file.fileUrl || idx}>
                                            <div className="unsupported-file-first-div">
                                                <PictureAsPdfRoundedIcon />
                                                <div className="vertical-line"></div>
                                            </div>
                                            <div className="file-preview-name" title={fileName}>
                                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                    {fileName}
                                                </a>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <a
                                            href={file.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            key={file.fileUrl || idx}
                                            className="post-image-link"
                                        >
                                            <img src={file.fileUrl} alt={fileName} />
                                        </a>
                                    );
                                }
                            })
                        ) : assignment.file ? (
                            <div className="unsupported-files post-side">
                                <div className="unsupported-file-first-div">
                                    <PictureAsPdfRoundedIcon />
                                    <div className="vertical-line"></div>
                                </div>
                                <div className="file-preview-name" title={assignment.file}>
                                    <a
                                        href={assignment.file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Attachment
                                    </a>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* YouTube Video Embeds */}
                {assignment.youtubeLinks && assignment.youtubeLinks.length > 0 && (
                    <div className="youtube-links-for-post user-post-side">
                        {assignment.youtubeLinks.map((link, index) => {
                            const embedUrl = link.includes("embed")
                                ? link
                                : link.includes("youtu.be")
                                ? `https://www.youtube.com/embed/${link.split("/").pop()}`
                                : link.includes("watch?v=")
                                ? `https://www.youtube.com/embed/${link.split("watch?v=")[1].split("&")[0]}`
                                : `https://www.youtube.com/embed/${link}`;
                            return (
                                <div className="youtube-video-container" key={index}>
                                    <iframe
                                        src={embedUrl}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Web Links */}
                {assignment.links && assignment.links.length > 0 && (
                    <div className="links-for-post user-post-side">
                        {assignment.links.map((link, idx) => (
                            <a
                                href={link.startsWith("http") ? link : `https://${link}`}
                                target="_blank"
                                rel="noreferrer"
                                key={idx}
                                className="post-link-card"
                            >
                                <LinkRoundedIcon className="post-link-icon" />
                                <span className="post-link-text">{link}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
            <div className="post-card-divider" />
            <CommentController comments={comments} onDeleteComment={handleDeleteComment} onEditComment={handleEditComment} />
            <AddCommentController addComment={addComment} />
            <ConfirmationDialog 
                open={confirmDelete}
                title="Delete Assignment"
                content="Are you sure you want to delete this assignment? All student submissions will also be deleted."
                confirmText="Delete"
                confirmColor="error"
                onConfirm={confirmDeleteAction}
                onCancel={() => setConfirmDelete(false)}
            />
            <EditAssignmentModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                assignment={assignment}
            />
        </div>
    );
}

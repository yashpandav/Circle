import React, { useEffect, useState, useRef } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import Divider from "@mui/material/Divider";
import { Menu, MenuItem, IconButton } from "@mui/material";
import { Assignment as AssignmentIcon } from "@mui/icons-material";
import "./postContainer.css";
import "./uploadFile.css";
import { CommentController, AddCommentController } from "./commentController";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createComment } from "../../../Api/apiCaller/commentapicaller";
import { deleteAssignment } from "../../../Api/apiCaller/assignmentapicaller";
import { LoaderComponent } from "../../Helper/Loaders/loader";
import { setLoading } from "../../../Slices/loadingSlice";
import { toast } from "react-hot-toast";
import socket from "../../../socket/socket";
import ConfirmationDialog from "../../Helper/ConfirmationDialog";

export default function AssignmentContainer({ assignment }) {
    const [comments, setComments] = useState(assignment.comment || []);
    const [anchorEl, setAnchorEl] = useState(null);
    const currUser = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isAnnouncer, setAnnouncer] = useState(false);
    const loading = useSelector((state) => state.loading.loading);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Controlled Height & Text Clamping
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        setAnnouncer(currUser?._id === assignment?.teacher?._id);
    }, [assignment, currUser]);

    useEffect(() => {
        if (contentRef.current) {
            const hasOverflow = contentRef.current.scrollHeight > 240;
            setIsOverflowing(hasOverflow);
        }
    }, [assignment?.description]);

    useEffect(() => {
        const handleNewComment = ({ data, parentId }) => {
            if (parentId === assignment._id) {
                setComments(prev => [...prev, data]);
            }
        };

        const handleDeletedComment = ({ commentId, parentId }) => {
            if (parentId === assignment._id) {
                setComments(prev => prev.filter(c => c._id !== commentId));
            }
        };

        socket.on('comment:new', handleNewComment);
        socket.on('comment:deleted', handleDeletedComment);

        return () => {
            socket.off('comment:new', handleNewComment);
            socket.off('comment:deleted', handleDeletedComment);
        };
    }, [assignment._id]);

    const addComment = async (newCommentText) => {
        const data = {
            commentBody: newCommentText,
            commentOn: "Assignment",
            id: assignment._id,
        };
        setLoading(true);
        await dispatch(createComment(data))
            .then(async (response) => {
                if (response && response.data) {
                    const { commentBody, user } = response.data;
                    const newComment = {
                        commentBody: commentBody,
                        user: {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            image: user.image,
                        },
                        _id: response.data._id,
                    };
                    setComments((prevComments) => [...prevComments, newComment]);
                }
            })
            .catch((error) => {
                console.error("Error adding comment:", error);
            });
        setLoading(false);
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
        setLoading(true);
        try {
            await dispatch(deleteAssignment(assignment._id)).unwrap();
        } catch (err) {
            console.error("Failed to delete assignment", err);
        }
        setLoading(false);
    };

    const handleEdit = () => {
        handleMenuClose();
        toast("Editing assignment feature coming soon!");
    };

    if (loading) {
        return <LoaderComponent />
    }

    return (
        <div className="post-container assignment-post-container" key={assignment._id}>
            <div className="post-wrapper">
                <div className="post-header">
                    <div className="left-side-post-details">
                        <div className="post-uploader-image assignment-icon-avatar" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: currClass.classTheme || '#1967d2',
                            color: 'white',
                            borderRadius: '50%'
                        }}>
                            <AssignmentIcon />
                        </div>
                        <div className="post-upload-details" style={{ cursor: 'pointer' }} onClick={() => navigate(`/workarea/circle/${currClass._id}/assignment/${assignment._id}`)}>
                            <h3 className="post-uploader-name">
                                {assignment.teacher.firstName} {assignment.teacher.lastName} posted an assignment
                            </h3>
                            <h6 className="post-upload-date">
                                {new Date(assignment.uploadDate)
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
                    {isAnnouncer && (
                        <IconButton className="more-vert-icon" onClick={handleMenuOpen}>
                            <MoreVertIcon />
                        </IconButton>
                    )}
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
                <Divider />

                {/* Assignment Title & Due Date */}
                <div className="assignment-body-header">
                    <h1 className="post-title" style={{ padding: 0 }}>{assignment.name}</h1>
                    {assignment.dueDate && (
                        <div className="assignment-due-badge">
                            Due {new Date(assignment.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
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

                {/* Attachment */}
                {assignment.file && (
                    <div className="post-attachments">
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
                    </div>
                )}
            </div>
            <Divider />
            <CommentController comments={comments} />
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
        </div>
    );
}

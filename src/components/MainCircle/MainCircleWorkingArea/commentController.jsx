import React, { useState } from "react";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import TextField from '@mui/material/TextField';
import { Button, IconButton, Typography } from "@mui/material";
import "./commentController.css";
import { useSelector } from "react-redux";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

function CommentController({ comments, onDeleteComment, onEditComment }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");

    const currUser = useSelector((state) => state?.auth?.user);
    const currClass = useSelector((state) => state?.classes?.currClass);

    // If expanded, show all. If not, show only the last (newest) comment.
    const displayComments = isExpanded 
        ? comments 
        : (comments.length > 0 ? [comments[comments.length - 1]] : []);

    const toggleExpand = () => setIsExpanded(prev => !prev);

    const isOwner = (comment) => {
        const commenterId = comment?.user?._id || comment?.user;
        return commenterId === currUser?._id;
    };

    const isAuthorizedToDelete = (comment) => {
        const isClassAdmin = currClass?.admin && (currClass.admin._id === currUser?._id || currClass.admin === currUser?._id);
        const isClassTeacher = currClass?.teacher && Array.isArray(currClass.teacher) && currClass.teacher.some(
            t => (t._id === currUser?._id || t === currUser?._id || t.id === currUser?._id)
        );
        return isOwner(comment) || isClassAdmin || isClassTeacher;
    };

    const handleEditSave = (commentId) => {
        if (editingText.trim() !== "" && onEditComment) {
            onEditComment(commentId, editingText);
        }
        setEditingCommentId(null);
        setEditingText("");
    };

    const formatCommentDate = (comment) => {
        let dateObj;
        if (comment.createdAt) {
            dateObj = new Date(comment.createdAt);
        } else if (comment._id && typeof comment._id === 'string' && comment._id.length === 24) {
            // Fallback to MongoDB ObjectId embedded timestamp for old comments
            const timestamp = parseInt(comment._id.substring(0, 8), 16) * 1000;
            dateObj = new Date(timestamp);
        } else {
            dateObj = new Date();
        }

        return dateObj.toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).replace(/:\d{2} /, " ").toLowerCase();
    };

    return (
        <div className="comment-controller">
            {comments && comments.length > 0 ? (
                <>
                    {comments.length > 1 && (
                        <Button
                            id="show-more-comment-btn"
                            startIcon={<PeopleAltIcon />}
                            onClick={toggleExpand}
                            sx={{
                                backgroundColor: "white",
                                color: "#343434",
                                "&:hover": { backgroundColor: "#f9f9f9ff" },
                                textTransform: "lowercase",
                                fontFamily: "monospace",
                                justifyContent: "flex-start",
                                paddingLeft: "16px"
                            }}
                        >
                            {isExpanded 
                                ? "Show Less" 
                                : `${comments.length - 1} more comments`}
                        </Button>
                    )}

                    {displayComments.map((comment) => (
                        <div key={comment._id} className="comment">
                            <div className="comment-header">
                                <img
                                    src={comment?.user?.image}
                                    alt="commenter"
                                    className="commenter-image"
                                />
                                <div className="comment-details">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h4 className="commenter-name">
                                                {comment?.user?.firstName} {comment?.user?.lastName}
                                            </h4>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                                {formatCommentDate(comment)}
                                            </Typography>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {isOwner(comment) && onEditComment && (
                                                <IconButton
                                                    onClick={() => {
                                                        setEditingCommentId(comment._id);
                                                        setEditingText(comment.commentBody);
                                                    }}
                                                    size="small"
                                                    sx={{ padding: "2px", opacity: 0.6, "&:hover": { opacity: 1, color: "primary.main" } }}
                                                    title="Edit comment"
                                                >
                                                    <EditOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            {isAuthorizedToDelete(comment) && onDeleteComment && (
                                                <IconButton 
                                                    onClick={() => onDeleteComment(comment._id)} 
                                                    size="small" 
                                                    sx={{ padding: "2px", opacity: 0.6, "&:hover": { opacity: 1, color: "error.main" } }}
                                                    title="Delete comment"
                                                >
                                                    <DeleteOutlineIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {editingCommentId === comment._id ? (
                                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                            <TextField
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                multiline
                                                size="small"
                                                fullWidth
                                                variant="outlined"
                                                autoFocus
                                            />
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <Button size="small" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                                                <Button size="small" variant="contained" onClick={() => handleEditSave(comment._id)} style={{ backgroundColor: 'var(--class-theme, #1967d2)' }}>Save</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="comment-body">{comment.commentBody}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            ) : null}
        </div>
    );
}

function AddCommentController({ addComment }) {
    const [commentText, setCommentText] = useState("");

    const currUser = useSelector((state) => state?.auth?.user);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim() === "") return;
        addComment(commentText);
        setCommentText("");
    };

    const handleKeyDown = (e) => {
        // Submit on Enter (but allow Shift+Enter for new lines)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="add-comment-controller">
            <img src={currUser?.image} alt="commenter" className="commenter-image" />
            <form className="add-comment-form" onSubmit={handleSubmit}>
                <TextField
                    className="add-comment-input"
                    placeholder="Add class comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    multiline
                    maxRows={4}
                    variant="standard"
                    InputProps={{
                        disableUnderline: true
                    }}
                />
                <IconButton
                    type="submit"
                    disabled={commentText.trim() === ""}
                    className="send-comment-icon-btn"
                    size="small"
                >
                    <SendRoundedIcon fontSize="small" />
                </IconButton>
            </form>
        </div>
    );
}

export { AddCommentController, CommentController };

import React, { useEffect } from "react";
import { useState } from "react";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import TextField from '@mui/material/TextField';
import { Button, IconButton } from "@mui/material";
import "./commentController.css";
import { useSelector } from "react-redux";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

function CommentController({ comments, onDeleteComment }) {
    const [visibleComments, setVisibleComments] = useState(1);
    const [displayComments, setDisplayComments] = useState(
        comments.length > 0 ? [comments[comments.length - 1]] : []
    );

    const currUser = useSelector((state) => state?.auth?.user);
    const currClass = useSelector((state) => state?.classes?.currClass);

    useEffect(() => {
        if (comments.length === 0) {
            setDisplayComments([]);
        } else if (comments.length === 1) {
            setDisplayComments([comments[comments.length - 1]]);
        } else {
            setDisplayComments(
                visibleComments === 1 ? [comments[comments.length - 1]] : [...comments]
            );
        }
    }, [visibleComments, comments]);

    const changeCommentLength = () => {
        if (visibleComments < comments.length) {
            setVisibleComments(comments.length);
        } else {
            setVisibleComments(1);
        }
    };

    const isAuthorizedToDelete = (comment) => {
        const isOwner = comment?.user?._id === currUser?._id;
        const isClassAdmin = currClass?.admin && (currClass.admin._id === currUser?._id || currClass.admin === currUser?._id);
        const isClassTeacher = currClass?.teacher && Array.isArray(currClass.teacher) && currClass.teacher.some(
            t => (t._id === currUser?._id || t === currUser?._id || t.id === currUser?._id)
        );
        return isOwner || isClassAdmin || isClassTeacher;
    };

    return (
        <div className="comment-controller">
            {comments && comments.length > 0 ? (
                <>
                    {comments.length > 1 && (
                        <Button
                            id="show-more-comment-btn"
                            startIcon={<PeopleAltIcon />}
                            onClick={changeCommentLength}
                            sx={{
                                backgroundColor: "white",
                                color: "#343434",
                                "&:hover": { backgroundColor: "#f9f9f9ff" },
                                textTransform: "lowercase",
                                fontFamily: "monospace",
                            }}
                        >
                            {visibleComments < comments.length
                                ? `${comments.length - 1} more comments`
                                : "Show Less"}
                        </Button>
                    )}

                    {displayComments.slice(0, visibleComments).map((comment) => (
                        <div key={comment._id} className="comment">
                            <div className="comment-header">
                                <img
                                    src={comment.user.image}
                                    alt="commenter"
                                    className="commenter-image"
                                />
                                <div className="comment-details">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                        <h4 className="commenter-name">
                                            {comment.user.firstName} {comment.user.lastName}
                                        </h4>
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
                                    <p className="comment-body">{comment.commentBody}</p>
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
            <img src={currUser.image} alt="commenter" className="commenter-image" />
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

import React, { useEffect } from "react";
import { useState } from "react";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { Button, IconButton } from "@mui/material";
import "./commentController.css";
import { useSelector } from "react-redux";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

function CommentController({ comments }) {
    const [visibleComments, setVisibleComments] = useState(1);
    const [displayComments, setDisplayComments] = useState([
        comments[comments.length - 1],
    ]);

    useEffect(() => {
        if (comments.length === 1) {
            setDisplayComments([comments[comments.length - 1]]);
            return;
        } else
            setDisplayComments(
                visibleComments === 1 ? [comments[comments.length - 1]] : [...comments]
            );
    }, [visibleComments, comments]);

    const changeCommentLength = () => {
        if (visibleComments < comments.length) {
            setVisibleComments(comments.length);
        } else {
            setVisibleComments(1);
        }
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
                                ? `${comments.length} more comments`
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
                                    <h4 className="commenter-name">
                                        {comment.user.firstName} {comment.user.lastName}
                                    </h4>
                                    <p className="comment-body">{comment.commentBody}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <></>
            )}
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

    return (
        <div className="add-comment-controller">
            <img src={currUser.image} alt="commenter" className="commenter-image" />
            <form className="add-comment-form">
                <textarea
                    className="add-comment-input"
                    placeholder="Add your comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                />
                <IconButton
                    disabled={commentText.trim() === "" ? true : false}
                    onClick={handleSubmit}
                >
                    <SendRoundedIcon />
                </IconButton>
            </form>
        </div>
    );
}

export { AddCommentController, CommentController };

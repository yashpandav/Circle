import React from "react";
import { useState } from "react";
import './commentController.css';

function CommentController({ comments }) {
    return (
        <div className="comment-controller">
            {comments && comments.length > 0 ? (
                comments.map((comment) => (
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
                ))
            ) : (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}
        </div>
    );
}


function AddCommentController({addComment}){
    const [commentText, setCommentText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim() === "") return;
        addComment(commentText);
        setCommentText("");
    };

    return (
        <div className="add-comment-controller">
            <form onSubmit={handleSubmit}>
                <textarea
                    className="comment-input"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows="3"
                />
                <button className="submit-comment-btn" type="submit">
                    Post Comment
                </button>
            </form>
        </div>
    );
}

export { AddCommentController , CommentController }
import React from "react";
import { useState } from "react";
import './commentController.css';

function CommentController({ comments }) {
    const [visibleComments, setVisibleComments] = useState(1);

    const showMoreComments = () => {
        setVisibleComments(comments.length);
    };

    const showLessComments = () => {
        setVisibleComments(1);
    };

    return (
        <div className="comment-controller">
            {comments && comments.length > 0 ? (
                <>
                    {comments.slice(0, visibleComments).map((comment) => (
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

                    {visibleComments < comments.length && (
                        <div className="show-more-btn-comment" onClick={showMoreComments}>
                            Show More Comments
                        </div>
                    )}
                    {visibleComments === comments.length && comments.length > 1 && (
                        <div className="show-less-btn-comment" onClick={showLessComments}>
                            Show Less
                        </div>
                    )}
                </>
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
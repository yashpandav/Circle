import React from "react";
import { useState } from "react";
import './commentController.css';

function CommentController({ comments }) {

    console.log(comments);

    return (
        // <div className="comments-controller">
        //     {comments && comments.length > 0 ? (
        //         comments.map((comment, index) => (
        //             <div key={index} className="comment">
        //                 <div className="comment-header">
        //                     {/* <img
        //                         src={comment.user.image}
        //                         alt="commenter"
        //                         className="commenter-image"
        //                     /> */}
        //                     <div className="comment-details">
        //                         <h4 className="commenter-name">{comment.user.name}</h4>
        //                         <p className="comment-date">
        //                             {new Date(comment.timestamp)
        //                                 .toLocaleString("en-GB", {
        //                                     day: "numeric",
        //                                     month: "long",
        //                                     year: "numeric",
        //                                     hour: "numeric",
        //                                     minute: "numeric",
        //                                     hour12: true,
        //                                 })}
        //                         </p>
        //                     </div>
        //                 </div>
        //                 <div className="comment-body">
        //                     <p>{comment.text}</p>
        //                 </div>
        //             </div>
        //         ))
        //     ) : (
        //         <p className="no-comment">No comment yet. Be the first to comment!</p>
        //     )}
        // </div>
        <></>
    );
}


function AddCommentController({addComment}){
    const [commentText, setCommentText] = useState(""); 

    const handleInputChange = (e) => {
        setCommentText(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (commentText.trim() === "") {
            return;
        }
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
                    onChange={handleInputChange}
                    rows="3"
                />
                <button className="submit-comment-btn" type="submit">Post Comment</button>
            </form>
        </div>
    );
}

export { AddCommentController , CommentController }
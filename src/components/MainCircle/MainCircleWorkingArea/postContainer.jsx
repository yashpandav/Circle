import React from "react";
import './postContainer.css'

export default function PostContainer({ post }) {
    return (
        <div className="post-container">
            <h1 className="post-title">{post.title}</h1>
            <p className="post-content">{post.postBody}</p>
        </div>
    );
}
it 
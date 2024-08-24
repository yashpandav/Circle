import React from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './postContainer.css';

export default function PostContainer({ post }) {
    return (
        <div className="post-container" key={post._id}>
            <div className="post-header">
                <div className="left-side-post-details">
                    <img src={post.teacher.image} alt='post-uploader-image' className="post-uploader-image" />
                    <div className="post-upload-details">
                        <h3 className="post-uploader-name">{post.teacher.firstName} {post.teacher.lastName}</h3>
                        <h6 className="post-upload-date">{new Date(post.uploadDate).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                        }).replace(/:\d{2} /, ' ')}</h6>
                    </div>
                </div>
                <MoreVertIcon className="more-vert-icon" />
            </div>
            <h1 className="post-title">{post.title}</h1>
            <p className="post-content">{post.postBody}</p>
        </div>
    );
}

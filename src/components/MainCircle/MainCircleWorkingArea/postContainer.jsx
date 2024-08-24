import React from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './postContainer.css';
import { Divider } from "@mui/material";

export default function PostContainer({ post }) {
    return (
        <div className="post-container" key={post._id}>
            <div className="post-wrapper">
                <div className="post-header">
                    <div className="left-side-post-details">
                        <img src={post.teacher.image} alt='post-uploader-img' className="post-uploader-image" />
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
                <Divider />
                <h1 className="post-title">{post.title}</h1>
                <p className="post-content">{post.postBody}</p>
                <div className="links-for-post user-post-side">
                    {
                        post.links && post.links.map((link) => {
                            return (
                                <a href={link} target="_blank" key={link}>{link}</a>
                            )
                        })
                    }
                </div>
                <div className="youtube-links-for-post user-post-side">
                    {
                        post.youtubeLinks && post.youtubeLinks.map((link , index) => {
                            return (
                                <iframe
                                    key={index}
                                    width="340"
                                    height="200"
                                    src={`https://www.youtube.com/embed/${link}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    );
}

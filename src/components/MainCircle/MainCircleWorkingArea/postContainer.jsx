import React from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import { Divider } from "@mui/material";
import './postContainer.css';

export default function PostContainer({ post }) {
    return (
        <div className="post-container" key={post._id}>
            <div className="post-wrapper">
                <div className="post-header">
                    <div className="left-side-post-details">
                        <img src={post.teacher.image} alt='Post uploader' className="post-uploader-image" />
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
                <div className="post-attachments">
                    {
                        post.postFiles && post.postFiles.map((file) => {
                            if (file.fileType === 'pdf') {
                                return (
                                    <div className="unsupported-files">
                                        <div className="unsupported-file-first-div">
                                            <PictureAsPdfRoundedIcon />
                                            <div className="vertical-line"></div>
                                        </div>
                                        <div className="file-preview-name" title={file.fileName}>
                                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" key={file.fileName}>This is A file Name{file.fileName}</a>
                                        </div>
                                    </div>
                                )
                            } else {
                                return (
                                    <img src={file.fileUrl} alt={`Attachment ${file.fileName}`} key={file.fileName} />
                                )
                            }
                        })
                    }
                </div>
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
                        post.youtubeLinks && post.youtubeLinks.map((link, index) => {
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
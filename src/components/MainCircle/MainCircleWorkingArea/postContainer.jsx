import React , {useState} from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import Divider from '@mui/material/Divider';
import "./postContainer.css";
import "./uploadFile.css";
import {CommentController} from "./commentController";
import { AddCommentController } from "./commentController";
import { useDispatch } from "react-redux";
import { createComment } from "../../../Api/apiCaller/commentapicaller";

export default function PostContainer({ post }) {
    const removeFileSuffix = (fileName) => {
        if (!fileName) return '';
        const nameParts = fileName.split("|");
        if (nameParts.length > 1) {
            return nameParts[0] + "." + fileName.split(".").pop();
        }
        return fileName;
    };

    const [comments, setComments] = useState(post.comments || []); 

    const dispatch = useDispatch();

    const addComment = async (newCommentText) => {

        const data = {
            commentBody : newCommentText,
            commentOn : "Post",
            id : post._id
        }

        const response = await dispatch(createComment(data))?.data;
        console.log(response);
    
        // setComments([...comments, newComment]);
    };


    console.log(post);

    return (
        <div className="post-container" key={post._id}>
            <div className="post-wrapper">
                <div className="post-header">
                    <div className="left-side-post-details">
                        <img
                            src={post.teacher.image}
                            alt="Post uploader"
                            className="post-uploader-image"
                        />
                        <div className="post-upload-details">
                            <h3 className="post-uploader-name">
                                {post.teacher.firstName} {post.teacher.lastName}
                            </h3>
                            <h6 className="post-upload-date">
                                {new Date(post.uploadDate)
                                    .toLocaleString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                        hour12: true,
                                    })
                                    .replace(/:\d{2} /, " ")}
                            </h6>
                        </div>
                    </div>
                    <MoreVertIcon className="more-vert-icon" />
                </div>
                <Divider />
                <h1 className="post-title">{post.title}</h1>
                <p
                    className="post-content"
                    dangerouslySetInnerHTML={{ __html: post.postBody }}
                ></p>

                {post.postFiles && post.postFiles.length > 0 && (
                    <div className="post-attachments">
                        {post.postFiles.map((file) => {
                            if (file.fileType === "pdf") {
                                return (
                                    <div
                                        className="unsupported-files post-side"
                                        key={file.fileName}
                                    >
                                        <div className="unsupported-file-first-div">
                                            <PictureAsPdfRoundedIcon />
                                            <div className="vertical-line"></div>
                                        </div>
                                        <div className="file-preview-name" title={file.fileName}>
                                            <a
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                key={file.fileName}
                                            >
                                                {removeFileSuffix(file.fileName)}
                                            </a>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <a
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        key={file.fileName}
                                    >
                                        <img
                                            src={file.fileUrl}
                                            alt={file.fileName}
                                            key={file.fileName}
                                        />
                                    </a>
                                );
                            }
                        })}
                    </div>
                )}

                {post.youtubeLinks && post.youtubeLinks.length > 0 && (
                    <div className="youtube-links-for-post user-post-side">
                        {post.youtubeLinks.map((link, index) => (
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
                        ))}
                    </div>
                )}
                {post.links && post.links.length > 0 && (
                    <div className="links-for-post user-post-side">
                        {post.links.map((link) => (
                            <a href={link} target="_blank" rel="noreferrer" key={link}>
                                {link}
                            </a>
                        ))}
                    </div>
                )}
            </div>
            <Divider></Divider>

            <CommentController comments={post.comment} />
            <AddCommentController addComment = {addComment}/>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import Divider from "@mui/material/Divider";
import { Menu, MenuItem, IconButton } from "@mui/material";
import "./postContainer.css";
import "./uploadFile.css";
import { CommentController, AddCommentController } from "./commentController";
import { useDispatch, useSelector } from "react-redux";
import { createComment } from "../../../Api/apiCaller/commentapicaller";
import { deletePost } from "../../../Api/apiCaller/postapicaller";
import { LoaderComponent } from "../../Helper/Loaders/loader";
import { setLoading } from "../../../Slices/loadingSlice";
import socket from "../../../socket/socket";
import ConfirmationDialog from "../../Helper/ConfirmationDialog";

export default function PostContainer({ post }) {
    const [comments, setComments] = useState(post.comment || []);
    const [anchorEl, setAnchorEl] = useState(null);
    const currUser = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const [isAnnouncer, setAnnouncer] = useState(false);
    const loading = useSelector((state) => state.loading.loading);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        setAnnouncer(currUser?._id === post?.teacher?._id);
    }, [post, currUser]);

    useEffect(() => {
        const handleNewComment = ({ data, parentId }) => {
            if (parentId === post._id) {
                setComments(prev => [...prev, data]);
            }
        };

        const handleDeletedComment = ({ commentId, parentId }) => {
            if (parentId === post._id) {
                setComments(prev => prev.filter(c => c._id !== commentId));
            }
        };

        socket.on('comment:new', handleNewComment);
        socket.on('comment:deleted', handleDeletedComment);

        return () => {
            socket.off('comment:new', handleNewComment);
            socket.off('comment:deleted', handleDeletedComment);
        };
    }, [post._id]);

    const removeFileSuffix = (fileName) => {
        if (!fileName) return "";
        const nameParts = fileName.split("|");
        return nameParts.length > 1
            ? nameParts[0] + "." + fileName.split(".").pop()
            : fileName;
    };

    const addComment = async (newCommentText) => {
        const data = {
            commentBody: newCommentText,
            commentOn: "Post",
            id: post._id,
        };
        setLoading(true);
        await dispatch(createComment(data))
            .then(async (response) => {
                if (response && response.data) {
                    const { commentBody, user } = response.data;
                    const newComment = {
                        commentBody: commentBody,
                        user: {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            image: user.image,
                        },
                        _id: response.data._id,
                    };
                    setComments((prevComments) => [...prevComments, newComment]);
                }
            })
            .catch((error) => {
                console.error("Error adding comment:", error);
            });
        setLoading(false);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        handleMenuClose();
        setConfirmDelete(true);
    };

    const confirmDeleteAction = async () => {
        setConfirmDelete(false);
        setLoading(true);
        try {
            await dispatch(deletePost(post._id));
        } catch (err) {
            console.error("Failed to delete post", err);
        }
        setLoading(false);
    };

    if (loading) {
        return <LoaderComponent />
    }

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
                    {isAnnouncer && (
                        <IconButton className="more-vert-icon" onClick={handleMenuOpen}>
                            <MoreVertIcon />
                        </IconButton>
                    )}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem
                            onClick={handleMenuClose}
                            sx={{
                                fontFamily: "Roboto, Arial, sans-serif",
                                fontSize: "15px",
                                fontWeight: 400,
                                letterSpacing: ".1px",
                                boxSizing: "border-box",
                                width: "120px",
                            }}
                        >
                            Edit
                        </MenuItem>
                        <MenuItem
                            onClick={handleDelete}
                            sx={{
                                fontFamily: "Roboto, Arial, sans-serif",
                                fontSize: "15px",
                                fontWeight: 400,
                                letterSpacing: ".1px",
                                boxSizing: "border-box",
                                width: "120px",
                            }}
                        >
                            Delete
                        </MenuItem>
                    </Menu>
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
            <Divider />
            <CommentController comments={comments} />
            <AddCommentController addComment={addComment} />
            <ConfirmationDialog 
                open={confirmDelete}
                title="Delete Post"
                content="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                confirmColor="error"
                onConfirm={confirmDeleteAction}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
}

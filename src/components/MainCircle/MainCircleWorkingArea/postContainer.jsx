import React, { useEffect, useState, useRef } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
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
import EditPostModal from "./EditPostModal";

export default function PostContainer({ post }) {
    const [comments, setComments] = useState(post.comment || []);
    const [anchorEl, setAnchorEl] = useState(null);
    const currUser = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);
    const dispatch = useDispatch();
    const [isAnnouncer, setAnnouncer] = useState(false);
    const loading = useSelector((state) => state.loading.loading);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Controlled Height & Text Clamping
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        const isOwner = currUser?._id && (currUser._id === post?.teacher?._id || currUser._id === post?.teacher);
        const isClassAdmin = currClass?.admin && (currClass.admin._id === currUser?._id || currClass.admin === currUser?._id);
        const isClassTeacher = currClass?.teacher && Array.isArray(currClass.teacher) && currClass.teacher.some(
            t => (t._id === currUser?._id || t === currUser?._id || t.id === currUser?._id)
        );

        setAnnouncer(Boolean(isOwner || isClassAdmin || isClassTeacher));
    }, [post, currUser, currClass]);

    useEffect(() => {
        if (contentRef.current) {
            // Check if post text/body exceeds balanced container height
            const hasOverflow = contentRef.current.scrollHeight > 240;
            setIsOverflowing(hasOverflow);
        }
    }, [post?.postBody]);

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

    const handleEdit = () => {
        handleMenuClose();
        setIsEditModalOpen(true);
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

    const getYouTubeEmbedUrl = (link) => {
        if (!link) return "";
        if (link.includes("youtube.com") || link.includes("youtu.be")) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = link.match(regExp);
            if (match && match[2].length === 11) {
                return `https://www.youtube.com/embed/${match[2]}`;
            }
        }
        return `https://www.youtube.com/embed/${link}`;
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
                            onClick={handleEdit}
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

                {/* Post Title */}
                {post.title && <h1 className="post-title">{post.title}</h1>}

                {/* Clamped Post Body with Wrapped Content */}
                <div 
                    ref={contentRef}
                    className={`post-content-wrapper ${isExpanded ? "expanded" : isOverflowing ? "clamped" : ""}`}
                >
                    <div
                        className="post-content"
                        dangerouslySetInnerHTML={{ __html: post.postBody }}
                    />
                </div>

                {isOverflowing && (
                    <button
                        type="button"
                        className="post-read-more-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <>Show less <ExpandLessRoundedIcon fontSize="small" /></>
                        ) : (
                            <>Read more <ExpandMoreRoundedIcon fontSize="small" /></>
                        )}
                    </button>
                )}

                {/* Attachments */}
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
                                        className="post-image-link"
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

                {/* YouTube Video Embeds */}
                {post.youtubeLinks && post.youtubeLinks.length > 0 && (
                    <div className="youtube-links-for-post user-post-side">
                        {post.youtubeLinks.map((link, index) => (
                            <div className="youtube-video-container" key={index}>
                                <iframe
                                    src={getYouTubeEmbedUrl(link)}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ))}
                    </div>
                )}

                {/* Links */}
                {post.links && post.links.length > 0 && (
                    <div className="links-for-post user-post-side">
                        {post.links.map((link, idx) => (
                            <a 
                                href={link.startsWith("http") ? link : `https://${link}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                key={idx}
                                className="post-link-card"
                            >
                                <LinkRoundedIcon className="post-link-icon" />
                                <span className="post-link-text">{link}</span>
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
            <EditPostModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={post}
            />
        </div>
    );
}

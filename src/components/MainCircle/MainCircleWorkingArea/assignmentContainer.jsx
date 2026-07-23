import React, { useEffect, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import Divider from "@mui/material/Divider";
import { Menu, MenuItem, IconButton } from "@mui/material";
import { Assignment as AssignmentIcon } from "@mui/icons-material";
import "./postContainer.css";
import "./uploadFile.css";
import { CommentController, AddCommentController } from "./commentController";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createComment } from "../../../Api/apiCaller/commentapicaller";
import { deleteAssignment } from "../../../Api/apiCaller/assignmentapicaller";
import { LoaderComponent } from "../../Helper/Loaders/loader";
import { setLoading } from "../../../Slices/loadingSlice";
import { toast } from "react-hot-toast";

export default function AssignmentContainer({ assignment }) {
    const [comments, setComments] = useState(assignment.comment || []);
    const [anchorEl, setAnchorEl] = useState(null);
    const currUser = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isAnnouncer, setAnnouncer] = useState(false);
    const loading = useSelector((state) => state.loading.loading);

    useEffect(() => {
        setAnnouncer(currUser?._id === assignment?.teacher?._id);
    }, [assignment, currUser]);

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
            commentOn: "Assignment",
            id: assignment._id,
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

    const handleDelete = async () => {
        handleMenuClose();
        setLoading(true);
        try {
            await dispatch(deleteAssignment(assignment._id)).unwrap();
        } catch (err) {
            console.error("Failed to delete assignment", err);
        }
        setLoading(false);
    };

    const handleEdit = () => {
        handleMenuClose();
        toast("Editing assignment feature coming soon!");
    };

    if (loading) {
        return <LoaderComponent />
    }

    return (
        <div className="post-container" key={assignment._id}>
            <div className="post-wrapper">
                <div className="post-header">
                    <div className="left-side-post-details">
                        <div className="post-uploader-image" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: currClass.classTheme,
                            color: 'white',
                            borderRadius: '50%'
                        }}>
                            <AssignmentIcon />
                        </div>
                        <div className="post-upload-details" style={{ cursor: 'pointer' }} onClick={() => navigate(`/workarea/circle/${currClass._id}/assignment/${assignment._id}`)}>
                            <h3 className="post-uploader-name">
                                {assignment.teacher.firstName} {assignment.teacher.lastName} posted a new assignment: {assignment.name}
                            </h3>
                            <h6 className="post-upload-date">
                                {new Date(assignment.uploadDate)
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
                <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="post-title" style={{ marginTop: 0 }}>{assignment.name}</h1>
                        <p
                            className="post-content"
                            dangerouslySetInnerHTML={{ __html: assignment.description }}
                            style={{ marginTop: '5px' }}
                        ></p>
                    </div>
                    {assignment.dueDate && (
                        <div style={{ color: '#5f6368', fontSize: '13px', fontWeight: '500' }}>
                            Due {new Date(assignment.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                        </div>
                    )}
                </div>

                {assignment.file && (
                    <div className="post-attachments">
                        <div className="unsupported-files post-side">
                            <div className="unsupported-file-first-div">
                                <PictureAsPdfRoundedIcon />
                                <div className="vertical-line"></div>
                            </div>
                            <div className="file-preview-name" title={assignment.file}>
                                <a
                                    href={assignment.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Attachment
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Divider />
            <CommentController comments={comments} />
            <AddCommentController addComment={addComment} />
        </div>
    );
}

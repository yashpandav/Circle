import React, { useState } from "react";
import { TextField, Button, IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { IoIosSend } from "react-icons/io";
import { Assignment, PostAdd, Share } from "@mui/icons-material";
import {
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    CloudUpload,
} from "@mui/icons-material";
import "./announcementContainer.css";

const UserAnnouncementHeader = ({ setWriteAssignment }) => {
    const user = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div
            className="announcement-header"
            onClick={() => setWriteAssignment(true)}
        >
            <img src={user.image} alt="user-img" className="user-img" />
            <div className="announce-content">
                <h6
                    className="announce-heading"
                    style={{ color: currClass.classTheme }}
                >
                    Announce something to your circle...
                </h6>
                <p className="announce-description">
                    Share updates, announcements, or important information with your
                    circle.
                </p>
            </div>
        </div>
    );
};

const ToggleSwitch = ({ isPost, setIsPost }) => {
    return (
        <div className="toggle-switch-container">
            <div
                className={`toggle-button ${isPost ? "active" : ""}`}
                onClick={() => setIsPost(true)}
            >
                <PostAdd style={{ marginRight: "5px" }} />
                Post
            </div>
            <div
                className={`toggle-button ${!isPost ? "active" : ""}`}
                onClick={() => setIsPost(false)}
            >
                <Assignment style={{ marginRight: "5px" }} />
                Assignment
            </div>
            <div className={`toggle-slider ${isPost ? "post" : "assignment"}`}></div>
        </div>
    );
};

const AnnouncementWriter = ({
    isPost,
    announcement,
    handleAnnouncementChange,
    toggleWriteAssignment,
    handlePost,
}) => {
    return (
        <div className="announcement-writer">
            <div className="toggle-container">
                <ToggleSwitch isPost={isPost} setIsPost={toggleWriteAssignment} />
                <div className="share-button" onClick={handlePost}>
                    <Share />
                    Share
                </div>
            </div>
            <div className="announcement-editor">
                <TextField
                    multiline
                    autoFocus
                    variant="standard"
                    value={announcement}
                    onChange={handleAnnouncementChange}
                    className="announcement-textfield no-border"
                    InputProps={{
                        style: {
                            color: "#28231d",
                            fontSize: "15px",
                            paddingInline: "10px",
                        },
                        disableUnderline: true,
                    }}
                />
                <div className="editor-controls">
                    <div className="left-side-controllers">
                        <IconButton color="primary" size="small">
                            <FormatBold />
                        </IconButton>
                        <IconButton color="primary" size="small">
                            <FormatItalic />
                        </IconButton>
                        <IconButton color="primary" size="small">
                            <FormatUnderlined />
                        </IconButton>
                        <IconButton color="primary" size="small">
                            <CloudUpload />
                        </IconButton>
                    </div>
                    <div className="right-side-controllers">
                        <IconButton
                            color="secondary"
                            size="small"
                            onClick={toggleWriteAssignment}
                        >
                            Cancel
                        </IconButton>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePost}
                            endIcon={<IoIosSend />}
                        >
                            Post
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AnnouncementContainer() {
    const [writeAssignment, setWriteAssignment] = useState(false);
    const [announcement, setAnnouncement] = useState("");
    const [isPost, setIsPost] = useState(true);

    const handleAnnouncementChange = (e) => {
        setAnnouncement(e.target.value);
    };

    const toggleWriteAssignment = () => {
        setWriteAssignment(!writeAssignment);
        setAnnouncement("");
    };

    const handlePost = () => {
        console.log("Post Announcement:", announcement);
        setAnnouncement("");
        setWriteAssignment(false);
    };

    return (
        <div className="main-announcement-container">
            <div className="announce-something-container">
                <UserAnnouncementHeader setWriteAssignment={setWriteAssignment} />
                {writeAssignment && (
                    <AnnouncementWriter
                        isPost={isPost}
                        announcement={announcement}
                        handleAnnouncementChange={handleAnnouncementChange}
                        toggleWriteAssignment={setIsPost}
                        handlePost={handlePost}
                    />
                )}
            </div>
        </div>
    );
}
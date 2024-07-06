import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { useSelector } from "react-redux";
import "./announcementContainer.css";

const UserAnnouncementHeader = () => {
    const user = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div className="announcement-header">
            <img src={user.image} alt="user-img" className="user-img" />
            <div className="announce-content">
                <h6 className="announce-heading" style={{ color: currClass.classTheme }}>
                    Announce something to your circle...
                </h6>
                <p className="announce-description">
                    Share updates, announcements, or important information with your circle.
                </p>
            </div>
        </div>
    );
};

const AnnouncementWriter = ({ writeAssignment, announcement, handleAnnouncementChange, toggleWriteAssignment }) => {
    return (
        <div className="announcement-writer">
            {writeAssignment ? (
                <div className="announcement-editor">
                    <TextField
                        multiline
                        autoFocus
                        variant="standard"
                        fullWidth
                        value={announcement}
                        onChange={handleAnnouncementChange}
                        className="announcement-textfield no-border"
                        InputProps={{
                            disableUnderline: true
                        }}
                    />
                    <Button variant="contained" color="primary" onClick={toggleWriteAssignment}>
                        Post Announcement
                    </Button>
                </div>
            ) : (
                <Button variant="outlined" color="primary" onClick={toggleWriteAssignment}>
                    Write Announcement
                </Button>
            )}
        </div>
    );
};

export default function AnnouncementContainer() {
    const [writeAssignment, setWriteAssignment] = useState(false);
    const [announcement, setAnnouncement] = useState("");

    const handleAnnouncementChange = (e) => {
        setAnnouncement(e.target.value);
    };

    const toggleWriteAssignment = () => {
        setWriteAssignment(!writeAssignment);
    };

    return (
        <div className="main-announcement-container">
            <div className="announce-something-container">
                <UserAnnouncementHeader />
                <AnnouncementWriter
                    writeAssignment={writeAssignment}
                    announcement={announcement}
                    handleAnnouncementChange={handleAnnouncementChange}
                    toggleWriteAssignment={toggleWriteAssignment}
                />
            </div>
        </div>
    );
}
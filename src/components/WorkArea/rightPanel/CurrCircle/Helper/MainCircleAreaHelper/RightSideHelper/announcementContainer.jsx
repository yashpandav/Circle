import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { IoIosSend } from "react-icons/io";
import { Assignment, PostAdd } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { FormatBold, FormatItalic, FormatUnderlined, CloudUpload } from "@mui/icons-material";
import "./announcementContainer.css";

const UserAnnouncementHeader = ({ setWriteAssignment }) => {
    const user = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div className="announcement-header" onClick={() => setWriteAssignment(true)}>
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

const ToggleSwitch = ({ isPost, setIsPost }) => {
    const currClass = useSelector((state) => state.classes.currClass);
    return (
        <div className="toggle-switch-container">
            <div className={`toggle-button ${isPost ? "active-opc" : ""}`}
                style={{
                    color: isPost ? currClass.classTheme : '#276e7e'
                }}
                onClick={() => setIsPost(true)}
            >
                <PostAdd style={{ marginRight: "5px" }} />
                <p>Post</p>
            </div>
            <div className={`toggle-button ${!isPost ? "active-opc" : ""}`}
                style={{
                    color: !isPost ? currClass.classTheme : '#276e7e'
                }}
                onClick={() => setIsPost(false)}
            >
                <Assignment style={{ marginRight: "5px" }} />
                <p>Assignment</p>
            </div>
        </div>
    );
};

const AnnouncementWriter = ({
    isPost,
    announcement,
    setAnnouncement,
    handleAnnouncementChange,
    toggleWriteAssignment,
    handlePost,
    handleClose
}) => {
    const currClass = useSelector((state) => state.classes.currClass);
    const announcementRef = useRef(null);

    const handleInput = () => {
        handleAnnouncementChange({ target: { value: announcementRef.current.innerHTML } });
    };

    const [selectedText, setSelectedText] = useState(null);
    const [selectionRange, setSelectionRange] = useState(null);

    const selectHandler = () => {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        setSelectedText(selectedText);
        console.log(selectedText);
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            setSelectionRange(range);
        }
    };

    const getIndexAndIfSelectedTextFromAnnouncement = () => {
        if (!selectionRange) return;

        const startContainer = selectionRange.startContainer;
        const endContainer = selectionRange.endContainer;
        const startOffset = selectionRange.startOffset;
        const endOffset = selectionRange.endOffset;

        let startIndex = 0;
        let endIndex = 0;

        if (startContainer.nodeType === Node.TEXT_NODE && endContainer.nodeType === Node.TEXT_NODE) {
            startIndex = Array.prototype.indexOf.call(startContainer.parentNode.childNodes, startContainer);
            endIndex = Array.prototype.indexOf.call(endContainer.parentNode.childNodes, endContainer);
        }
        console.log('Start index:', startIndex, 'Start offset:', startOffset);
        console.log('End index:', endIndex, 'End offset:', endOffset);

        return { startIndex, endIndex };
    };


    const changesIntoAnnouncement = () => {
        const { startIndex, endIndex } = getIndexAndIfSelectedTextFromAnnouncement();
        if (startIndex === undefined || endIndex === undefined) return;

        const announcementText = announcement.slice(0, startIndex) +
            "<b>" + announcement.slice(startIndex, endIndex) + "</b>" +
            announcement.slice(endIndex);

        handleAnnouncementChange({ target: { value: announcementText } });
    };
}

return (
    <div className="announcement-writer">
        <div className="toggle-container">
            <ToggleSwitch isPost={isPost} setIsPost={toggleWriteAssignment} />
        </div>
        <div className="announcement-editor">
            <div
                ref={announcementRef}
                contentEditable="true"
                className="announcement-textfield no-border"
                onInput={handleInput}
                dangerouslySetInnerHTML={{ __html: announcement }}
                onSelect={selectHandler}
            />

            <div className="editor-controls">
                <div className="left-side-controllers">
                    <IconButton color="primary" size="small" onClick={changesIntoAnnouncement}>
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
                    <button className="button-cancel" onClick={handleClose}>
                        Cancel
                    </button>
                    <button className="button-post" onClick={handlePost}>
                        Post <IoIosSend />
                    </button>
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
        let strRev = "";
        for (let i = announcement.length - 1; i >= 0; i--) {
            strRev += announcement[i];
        }
        setAnnouncement(strRev);
    };

    const toggleWriteAssignment = (isPost) => {
        setWriteAssignment(true);
        setIsPost(isPost);
    };

    const handleClose = () => {
        setWriteAssignment(false);
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
                        setAnnouncement={setAnnouncement}
                        handleAnnouncementChange={handleAnnouncementChange}
                        toggleWriteAssignment={setIsPost}
                        handlePost={handlePost}
                        handleClose={handleClose}
                    />
                )}
            </div>
        </div>
    );
}
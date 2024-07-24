import React, { useState, useEffect } from "react";
import { TextField, IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { IoIosSend } from "react-icons/io";
import {
    Assignment,
    PostAdd,
    Delete,
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    CloudUpload,
} from "@mui/icons-material";
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
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
    const currClass = useSelector((state) => state.classes.currClass);
    return (
        <div className="toggle-switch-container">
            <div
                className={`toggle-button ${isPost ? "active-opc" : ""}`}
                style={{
                    color: isPost ? currClass.classTheme : "#276e7e",
                }}
                onClick={() => setIsPost(true)}
            >
                <PostAdd style={{ marginRight: "5px" }} />
                <p>Post</p>
            </div>
            <div
                className={`toggle-button ${!isPost ? "active-opc" : ""}`}
                style={{
                    color: !isPost ? currClass.classTheme : "#276e7e",
                }}
                onClick={() => setIsPost(false)}
            >
                <Assignment style={{ marginRight: "5px" }} />
                <p>Assignment</p>
            </div>
        </div>
    );
};

const FilePreview = ({ file, onDelete }) => {
    const [showDeleteBtn, setShowDeleteBtn] = useState(true);

    let content;
    if (file.type.startsWith("image/")) {
        content = <img src={file.url} alt="Preview" />;
    } else if (file.type.startsWith("video/")) {
        content = (
            <video controls>
                <source src={file.url} type={file.type} />
            </video>
        );
    } else {
        content = (
            <div className="unsupported-files">
                {
                    file.type.startsWith("application/pdf") ? (<PictureAsPdfRoundedIcon/>) : (<TextSnippetIcon/>)
                }
                <div className="file-preview-name">{file.name}</div>
            </div>
        );
    }

    return (
        <div className="file-preview-teacher">
            {content}
            {showDeleteBtn && (
                <IconButton
                    className="delete-prev-btn"
                    onClick={() => onDelete(file.name)}
                    color="secondary"
                    style={{ zIndex: 10 }}
                >
                    <Delete style={{ fontSize: '2rem' }} />
                </IconButton>
            )}
        </div>
    );
};

const AnnouncementWriter = ({
    isPost,
    announcement,
    handleAnnouncementChange,
    toggleWriteAssignment,
    handlePost,
    handleClose,
}) => {
    const currClass = useSelector((state) => state.classes.currClass);

    const [files, setFiles] = useState([]);

    useEffect(() => {
        files.forEach((file) => {
            if (!file.url && file.file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFiles((prevFiles) =>
                        prevFiles.map((f) =>
                            f.name === file.name ? { ...f, url: reader.result } : f
                        )
                    );
                };
                reader.readAsDataURL(file.file);
            }
        });
    }, [files]);

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files).map((file) => ({
            file,
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
        }));
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };

    const handleDeleteFile = (fileName) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
    };

    return (
        <div className="announcement-writer">
            <div className="toggle-container">
                <ToggleSwitch isPost={isPost} setIsPost={toggleWriteAssignment} />
            </div>
            <div className="announcement-editor">
                <TextField
                    placeholder="Type in here…"
                    minRows={2}
                    maxRows={10}
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
                            caretColor: currClass.classTheme,
                        },
                        disableUnderline: true,
                    }}
                />
                <div className="preview-of-upload-container">
                    {files.map((file) => (
                        <FilePreview
                            key={file.name}
                            file={file}
                            onDelete={handleDeleteFile}
                        />
                    ))}
                </div>
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
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <IconButton component="span" color="primary" size="small">
                                <CloudUpload />
                            </IconButton>
                        </label>
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

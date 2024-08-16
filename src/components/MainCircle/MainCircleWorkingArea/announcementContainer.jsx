import React, { useState, useEffect } from "react";
import { TextField, IconButton, Button } from "@mui/material";
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
    Computer,
    YouTube,
    Link
} from "@mui/icons-material";
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CloseIcon from '@mui/icons-material/Close';
import "./announcementContainer.css";
import './uploadFile.css';

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
            {['Post', 'Assignment'].map((type) => (
                <div
                    key={type}
                    className={`toggle-button ${isPost === (type === 'Post') ? "active-opc" : ""}`}
                    style={{ color: isPost === (type === 'Post') ? currClass.classTheme : "#276e7e" }}
                    onClick={() => setIsPost(type === 'Post')}
                >
                    {type === 'Post' ? <PostAdd style={{ marginRight: "5px" }} /> : <Assignment style={{ marginRight: "5px" }} />}
                    <p>{type}</p>
                </div>
            ))}
        </div>
    );
};

const FilePreview = ({ file, onDelete }) => {
    const isMediaFile = file.type.startsWith("image/") || file.type.startsWith("video/");
    const isPdf = file.type.startsWith("application/pdf");

    return (
        <div className={isMediaFile ? "file-preview-teacher" : "unsupported-file-container"} style={!isMediaFile ? { width: '80%' } : {}}>
            {isMediaFile ? (
                <>
                    {file.type.startsWith("image/") ? (
                        <img src={file.url} alt="Preview" />
                    ) : (
                        <video controls>
                            <source src={file.url} type={file.type} />
                        </video>
                    )}
                    <IconButton className="delete-prev-btn" onClick={() => onDelete(file.name)} color="secondary">
                        <Delete />
                    </IconButton>
                </>
            ) : (
                <div className="unsupported-files">
                    <div className="unsupported-file-first-div">
                        {isPdf ? <PictureAsPdfRoundedIcon /> : <TextSnippetIcon />}
                        <div className="vertical-line"></div>
                    </div>
                    <div className="file-preview-name" title={file.name}>{file.name}</div>
                    <div className="unsupported-file-last-div">
                        <div className="unsupported-delete-icon" onClick={() => onDelete(file.name)}>
                            <CloseIcon />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LinkInput = ({ onSubmit, onCancel }) => {
    const [linkUrl, setLinkUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(linkUrl);
        setLinkUrl('');
        onCancel();
    };

    const currClass = useSelector((state) => state.classes.currClass);
    const borderFocusColor = currClass.classTheme;

    return (
        <form onSubmit={handleSubmit} className="link-input-form">
            <div className="link-input-container" style={{
                border: `1px solid ${borderFocusColor}`
            }}>
                <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Enter URL"
                    required
                    className="link-input"
                />
                <IconButton type="button" onClick={onCancel} className="close-link-btn" title="Cancel">
                    <CloseIcon className="icon" style={{
                        color: borderFocusColor,
                    }} />
                </IconButton>
                <Button variant="outlined" type="submit" style={{
                    border: 'none',
                    color:borderFocusColor
                }}>
                    Add
                </Button>
            </div>
        </form>
    );
};


const YouTubeLinkInput = ({ onSubmit, onCancel }) => {
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(youtubeUrl);
        setYoutubeUrl('');
    };

    return (
        <form onSubmit={handleSubmit} className="youtube-link-input-form">
            <div className="youtube-link-input-container">
                <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Enter YouTube URL"
                    required
                    className="youtube-link-input"
                />
                <div className="youtube-link-input-buttons">
                    <button type="submit" className="youtube-link-submit-btn">Add</button>
                    <button type="button" onClick={onCancel} className="youtube-link-cancel-btn">Cancel</button>
                </div>
            </div>
        </form>
    );
};
const AnnouncementWriter = ({
    isPost,
    announcement,
    links,
    youtubeLinks,
    handleAnnouncementChange,
    toggleWriteAssignment,
    handlePost,
    handleClose,
    files,
    setFiles,
    handleFileChange,
    handleDeleteFile,
    handleLinkSubmit,
    handleYouTubeLinkSubmit,
    handleRemoveLink,
    handleRemoveYouTubeLink
}) => {
    const currClass = useSelector((state) => state.classes.currClass);
    const [showUploadOptions, setShowUploadOptions] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [showYouTubeInput, setShowYouTubeInput] = useState(false);

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

    const handleUploadOption = (option) => {
        setShowUploadOptions(false);
        if (option === 'computer') {
            document.getElementById('file-upload').click();
        } else if (option === 'other') {
            setShowLinkInput(true);
        }
    };

    const handleYouTubeLinkSubmitInternal = (url) => {
        handleYouTubeLinkSubmit(url);
        setShowYouTubeInput(false);
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
                {links.map((link, index) => (
                    <div key={index} className="link-preview">
                        <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                        <IconButton onClick={() => handleRemoveLink(link)} color="secondary">
                            <Delete />
                        </IconButton>
                    </div>
                ))}
                {youtubeLinks.map((url, index) => (
                    <div key={index} className="youtube-preview">
                        <iframe
                            width="560"
                            height="315"
                            src={`https://www.youtube.com/embed/${url}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                        <IconButton onClick={() => handleRemoveYouTubeLink(url)} color="secondary">
                            <Delete />
                        </IconButton>
                    </div>
                ))}
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
                        <div className="upload-container">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                                id="file-upload"
                            />
                            <IconButton
                                component="span"
                                color="primary"
                                size="small"
                                onClick={() => setShowUploadOptions(!showUploadOptions)}
                            >
                                <CloudUpload />
                            </IconButton>
                            {showUploadOptions && (
                                <div className="upload-options">
                                    <IconButton onClick={() => handleUploadOption('computer')}>
                                        <Computer style={{ color: 'purple' }} />
                                    </IconButton>
                                    <IconButton onClick={() => setShowYouTubeInput(true)}>
                                        <YouTube style={{ color: 'red' }} />
                                    </IconButton>
                                    <IconButton onClick={() => handleUploadOption('other')}>
                                        <Link style={{ color: '#076048' }} />
                                    </IconButton>
                                </div>
                            )}
                        </div>
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
                {showLinkInput && (
                    <LinkInput
                        onSubmit={handleLinkSubmit}
                        onCancel={() => setShowLinkInput(false)}
                    />
                )}
                {showYouTubeInput && (
                    <YouTubeLinkInput
                        onSubmit={handleYouTubeLinkSubmitInternal}
                        onCancel={() => setShowYouTubeInput(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default function AnnouncementContainer() {
    const [writeAssignment, setWriteAssignment] = useState(false);
    const [isPost, setIsPost] = useState(true);
    const [finalAnnouncement, setFinalAnnouncement] = useState({
        text: "",
        links: [],
        files: [],
        youtubeLinks: []
    });

    const handleAnnouncementChange = (e) => {
        setFinalAnnouncement(prev => ({
            ...prev,
            text: e.target.value
        }));
    };

    const handleClose = () => {
        setWriteAssignment(false);
        setFinalAnnouncement({ text: "", links: [], files: [], youtubeLinks: [] });
    };

    const handlePost = () => {
        console.log("Post Announcement:", finalAnnouncement);
        setFinalAnnouncement({ text: "", links: [], files: [], youtubeLinks: [] });
        setWriteAssignment(false);
    };

    const handleRemoveYouTubeLink = (urlToRemove) => {
        setFinalAnnouncement(prev => ({
            ...prev,
            youtubeLinks: prev.youtubeLinks.filter(url => url !== urlToRemove)
        }));
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files).map((file) => ({
            file,
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
        }));

        setFinalAnnouncement(prev => ({
            ...prev,
            files: [...prev.files, ...newFiles]
        }));
    };

    const handleDeleteFile = (fileName) => {
        setFinalAnnouncement(prev => ({
            ...prev,
            files: prev.files.filter((file) => file.name !== fileName)
        }));
    };

    const handleLinkSubmit = (url) => {
        setFinalAnnouncement(prev => ({
            ...prev,
            links: [...prev.links, url]
        }));
    };

    const handleYouTubeLinkSubmit = (url) => {
        console.log(url);
        const videoId = new URL(url).searchParams.get("v");
        console.log(videoId);
        if (videoId) {
            setFinalAnnouncement(prev => ({
                ...prev,
                youtubeLinks: [...prev.youtubeLinks, videoId]
            }));
        }
    };

    return (
        <div className="main-announcement-container">
            <div className="announce-something-container">
                <UserAnnouncementHeader setWriteAssignment={setWriteAssignment} />
                {writeAssignment && (
                    <AnnouncementWriter
                        isPost={isPost}
                        announcement={finalAnnouncement.text}
                        links={finalAnnouncement.links}
                        youtubeLinks={finalAnnouncement.youtubeLinks}
                        handleAnnouncementChange={handleAnnouncementChange}
                        toggleWriteAssignment={setIsPost}
                        handlePost={handlePost}
                        handleClose={handleClose}
                        files={finalAnnouncement.files}
                        handleFileChange={handleFileChange}
                        handleDeleteFile={handleDeleteFile}
                        handleLinkSubmit={handleLinkSubmit}
                        handleYouTubeLinkSubmit={handleYouTubeLinkSubmit}
                        handleRemoveYouTubeLink={handleRemoveYouTubeLink}
                    />
                )}
            </div>
        </div>
    );
}

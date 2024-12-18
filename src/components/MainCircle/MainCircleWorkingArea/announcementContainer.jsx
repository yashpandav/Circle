import React, { useState, useRef } from "react";
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
import CloseIcon from '@mui/icons-material/Close';
import "./announcementContainer.css";
import './uploadFile.css';
import { createPost } from "../../../Api/apiCaller/postapicaller";
import { useDispatch } from "react-redux";

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
    const isMediaFile = file.type.startsWith("image/");

    return (
        <div className={isMediaFile ? "file-preview-teacher" : "unsupported-file-container"} style={!isMediaFile ? { width: '80%' } : {}}>
            {isMediaFile ? (
                <>
                    <img src={file.url} alt="Preview" />
                    <IconButton className="delete-prev-btn" onClick={() => onDelete(file.name)} color="secondary">
                        <Delete />
                    </IconButton>
                </>
            ) : (
                <div className="unsupported-files">
                    <div className="unsupported-file-first-div">
                        <PictureAsPdfRoundedIcon />
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
    const [isFocused, setIsFocused] = useState(false);

    const currClass = useSelector((state) => state.classes.currClass);
    const borderFocusColor = currClass.classTheme;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(linkUrl);
        setLinkUrl('');
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={`link-input-container ${isFocused ? 'focused' : ''}`}
                style={{
                    border: isFocused ? `1px solid ${borderFocusColor}` : `1px solid #276e7e`
                }}>
                <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Enter URL"
                    required
                    className="link-input"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <IconButton type="button" onClick={onCancel} className="close-link-btn" title="Cancel">
                    <CloseIcon className="icon" style={{ color: 'grey' }} />
                </IconButton>
                <Button variant="outlined" type="submit" style={{
                    border: 'none',
                    color: 'white',
                    backgroundColor: borderFocusColor
                }}>
                    Add
                </Button>
            </div>
        </form>
    );
};

const YouTubeLinkInput = ({ onSubmit, onCancel }) => {
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(youtubeUrl);
        setYoutubeUrl('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="link-input-container"
                style={{
                    border: isFocused ? `1px solid red` : `1px solid #276e7e`
                }}>
                <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Enter YouTube URL"
                    required
                    className="link-input"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <IconButton type="button" onClick={onCancel} className="close-link-btn" title="Cancel">
                    <CloseIcon className="icon" style={{
                        color: 'grey',
                    }} />
                </IconButton>
                <Button variant="outlined" type="submit" style={{
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none'
                }}>
                    Add
                </Button>
            </div>
        </form>
    );
};
const AnnouncementWriter = ({
    isPost,
    announcement,
    title,
    links,
    youtubeLinks,
    handleTitleChange,
    handleAnnouncementChange,
    toggleWriteAssignment,
    handlePost,
    handleClose,
    files,
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
    const announcementRef = useRef(null);

    const applyFormatting = (command) => {
        document.execCommand(command, false, null);
    };

    const handleAnnouncementChangeInternal = () => {
        const htmlContent = announcementRef.current.innerHTML;
        handleAnnouncementChange({ target: { value: htmlContent } });
    };


    const handleUploadOption = (option) => {
        setShowUploadOptions(false);
        if (option === 'computer') {
            document.getElementById('file-upload').click();
        } else if (option === 'other') {
            setShowLinkInput(true);
        } else {
            setShowYouTubeInput(true);
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
                    placeholder="Post Title"
                    autoFocus
                    variant="standard"
                    value={title}
                    onChange={handleTitleChange}
                    className="announcement-textfield"
                    id="header-textfield"
                    InputProps={{
                        style: {
                            caretColor: currClass.classTheme,
                        },
                        disableUnderline: true,
                    }}
                />
                <div
                    ref={announcementRef}
                    contentEditable
                    className="announcement-textfield content-editable"
                    onInput={handleAnnouncementChangeInternal}
                    style={{
                        caretColor: currClass.classTheme,
                    }}
                    dir="ltr"
                ></div>
                <div className="preview-of-upload-container">
                    {files.map((file) => (
                        <FilePreview
                            key={file.name}
                            file={file}
                            onDelete={handleDeleteFile}
                        />
                    ))}
                </div>
                <div className="youtube-links-for-post uploader-post-side">
                    {youtubeLinks.map((url, index) => (
                        <div key={index} className="youtube-preview">
                            <iframe
                                key={index}
                                width="340"
                                height="200"
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
                </div>
                <div className="links-for-post">
                    {links.map((link, index) => (
                        <div key={index} className="link-preview">
                            <a href={link} target="_blank" rel="noreferrer">{link}</a>
                            <IconButton onClick={() => handleRemoveLink(link)} color="secondary">
                                <Delete />
                            </IconButton>
                        </div>
                    ))}
                </div>
                
                <div className="editor-controls">
                    <div className="left-side-controllers">
                        <IconButton color="primary" size="small" onClick={() => applyFormatting("bold")}>
                            <FormatBold />
                        </IconButton>
                        <IconButton color="primary" size="small" onClick={() => applyFormatting("italic")}>
                            <FormatItalic />
                        </IconButton>
                        <IconButton color="primary" size="small" onClick={() => applyFormatting("underline")}>
                            <FormatUnderlined />
                        </IconButton>
                        <div className="upload-container">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                                accept=".jpg,.jpeg,.png,.pdf"
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
                                    <IconButton onClick={() => handleUploadOption('Youtube')}>
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
    const currClass = useSelector((state) => state.classes.currClass);
    const [writeAssignment, setWriteAssignment] = useState(false);
    const [isPost, setIsPost] = useState(true);
    const dispatch = useDispatch();
    const [data, setdata] = useState({
        currClassId: currClass._id,
        title: "",
        text: "",
        links: [],
        files: [],
        youtubeLinks: []
    });

    const handleTitleChange = (e) => {
        setdata(prev => ({
            ...prev,
            title: e.target.value
        }));
    };

    const handleAnnouncementChange = (e) => {
        setdata(prev => ({
            ...prev,
            text: e.target.value
        }));
    };

    const handleClose = () => {
        setWriteAssignment(false);
        setdata({ title: "", text: "", links: [], files: [], youtubeLinks: [] });
    };

    const handlePost = async () => {
        try {
            const formData = new FormData();
            data.files.forEach((file) => {
                formData.append("files", file.file);
            });
            formData.append('title', data.title);
            formData.append('text', data.text);
            data.links.forEach((link) => {
                formData.append('links', link);
            });
            data.youtubeLinks.forEach((link) => {
                formData.append('youtubeLinks', link);
            });
            formData.append('currClassId', currClass._id);

            const response = await dispatch(createPost(formData)).unwrap();
            console.log("API RESPONSE ", response);
        } catch (err) {
            console.error("Error During Posting Announcement");
        }
        setdata((prev) => ({
            ...prev,
            title: "",
            text: "",
            links: [],
            files: [],
            youtubeLinks: []
        }));

        setWriteAssignment(false);
    };

    const handleRemoveYouTubeLink = (urlToRemove) => {
        setdata(prev => ({
            ...prev,
            youtubeLinks: prev.youtubeLinks.filter(url => url !== urlToRemove)
        }));
    };

    const handleRemoveLink = (urlToRemove) => {
        setdata(prev => ({
            ...prev,
            links: prev.links.filter(url => url !== urlToRemove)
        }));
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files).map((file) => ({
            file,
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
        }));

        setdata(prev => ({
            ...prev,
            files: [...prev.files, ...newFiles]
        }));
    };

    const handleDeleteFile = (fileName) => {
        setdata(prev => ({
            ...prev,
            files: prev.files.filter((file) => file.name !== fileName)
        }));
    };

    const handleLinkSubmit = (url) => {
        setdata(prev => ({
            ...prev,
            links: [...prev.links, url]
        }));
    };

    const handleYouTubeLinkSubmit = (url) => {
        const videoId = new URL(url).searchParams.get("v");
        if (videoId) {
            setdata(prev => ({
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
                        title={data.title}
                        announcement={data.text}
                        links={data.links}
                        youtubeLinks={data.youtubeLinks}
                        handleTitleChange={handleTitleChange}
                        handleAnnouncementChange={handleAnnouncementChange}
                        toggleWriteAssignment={setIsPost}
                        handlePost={handlePost}
                        handleClose={handleClose}
                        files={data.files}
                        handleFileChange={handleFileChange}
                        handleDeleteFile={handleDeleteFile}
                        handleLinkSubmit={handleLinkSubmit}
                        handleYouTubeLinkSubmit={handleYouTubeLinkSubmit}
                        handleRemoveYouTubeLink={handleRemoveYouTubeLink}
                        handleRemoveLink={handleRemoveLink}
                    />
                )}
            </div>
        </div>
    );
}
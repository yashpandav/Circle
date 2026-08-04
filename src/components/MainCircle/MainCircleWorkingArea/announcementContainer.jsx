import React, { useState, useRef, useEffect, useCallback } from "react";
import { TextField, IconButton, Button } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
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
import { setLoading } from "../../../Slices/loadingSlice";
import { createAssignment } from "../../../Api/apiCaller/assignmentapicaller";
import { createCategory } from "../../../Api/apiCaller/categoryapicaller";
import { updateCurrClass } from "../../../Slices/classSlice";
import TopicDropdown from "../../Helper/TopicDropdown";
import toast from "react-hot-toast";

const UserAnnouncementHeader = ({ setWriteAssignment }) => {
    const user = useSelector((state) => state?.auth?.user);
    const userImage = user?.image || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}+${user?.lastName || ''}&background=4285f4&color=fff&bold=true`;

    return (
        <div className="announcement-header" onClick={() => setWriteAssignment(true)}>
            <img src={userImage} alt="user-img" className="user-img" />
            <div className="announce-content">
                <h6 className="announce-heading">
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
    return (
        <div className="toggle-switch-container">
            {['Post', 'Assignment'].map((type) => (
                <div
                    key={type}
                    className={`toggle-button ${isPost === (type === 'Post') ? "active-opc" : ""}`}
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
                    <div className="delete-prev-btn" onClick={() => onDelete(file.name)}>
                        <Delete />
                    </div>
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(linkUrl);
        setLinkUrl('');
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={`link-input-container ${isFocused ? 'focused' : ''}`}>
                <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Enter URL (e.g., https://example.com)"
                    required
                    className="link-input"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <IconButton type="button" onClick={onCancel} size="small" className="close-link-btn" title="Cancel" style={{ marginRight: '5px' }}>
                    <CloseIcon style={{ color: '#94a3b8', fontSize: '20px' }} />
                </IconButton>
                <Button variant="contained" type="submit" size="small" style={{ backgroundColor: 'var(--class-theme, #1967d2)', color: 'white', textTransform: 'none', boxShadow: 'none' }}>
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
            <div className={`link-input-container ${isFocused ? 'focused-youtube' : ''}`} style={{ borderColor: isFocused ? '#ef4444' : '#cbd5e1' }}>
                <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Enter YouTube URL (e.g., https://youtube.com/watch?v=...)"
                    required
                    className="link-input"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <IconButton type="button" onClick={onCancel} size="small" className="close-link-btn" title="Cancel" style={{ marginRight: '5px' }}>
                    <CloseIcon style={{ color: '#94a3b8', fontSize: '20px' }} />
                </IconButton>
                <Button variant="contained" type="submit" size="small" style={{ backgroundColor: '#ef4444', color: 'white', textTransform: 'none', boxShadow: 'none' }}>
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
    handleDueDateChange,
    dueDate,
    categoryId,
    handleCategoryChange,
    toggleWriteAssignment,
    handlePost,
    handleClose,
    files,
    handleFileChange,
    handleDeleteFile,
    handleLinkSubmit,
    handleYouTubeLinkSubmit,
    handleRemoveLink,
    handleRemoveYouTubeLink,
    loading,
    isTeacherOrAdmin
}) => {
    const [showUploadOptions, setShowUploadOptions] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [showYouTubeInput, setShowYouTubeInput] = useState(false);
    const announcementRef = useRef(null);

    useEffect(() => {
        if (announcementRef.current && announcement === "") {
            announcementRef.current.innerHTML = "";
        }
    }, [announcement]);

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
            {isTeacherOrAdmin && (
                <div className="toggle-container">
                    <ToggleSwitch isPost={isPost} setIsPost={toggleWriteAssignment} />
                </div>
            )}
            <div className="announcement-editor">
                <TextField
                    placeholder={isPost ? "Post Title" : "Assignment Title"}
                    autoFocus
                    variant="standard"
                    value={title}
                    onChange={handleTitleChange}
                    className="header-textfield"
                    InputProps={{
                        style: {
                            caretColor: 'var(--class-theme)',
                            color: '#1e293b',
                            fontSize: '21.5px',
                            fontWeight: 600,
                            padding: '0 5px'
                        },
                        disableUnderline: true,
                    }}
                />
                {!isPost && (
                    <TextField
                        type="datetime-local"
                        label="Due Date"
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={dueDate}
                        onChange={handleDueDateChange}
                        style={{ marginTop: '15px', width: '250px' }}
                    />
                )}



                <div
                    ref={announcementRef}
                    contentEditable
                    className="announcement-textfield content-editable"
                    onInput={handleAnnouncementChangeInternal}
                    style={{
                        marginTop: '5px'
                    }}
                    dir="ltr"
                    data-placeholder={isPost ? "Announce Here..." : "Assignment details..."}
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
                    {youtubeLinks.map((url) => (
                        <div key={url} className="youtube-preview">
                            <iframe
                                key={url}
                                width="340"
                                height="200"
                                src={`https://www.youtube.com/embed/${url}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            <IconButton onClick={() => handleRemoveYouTubeLink(url)} color="error" size="small">
                                <Delete fontSize="small" />
                            </IconButton>
                        </div>
                    ))}
                </div>
                <div className="links-for-post">
                    {links.map((link) => (
                        <div key={link} className="unsupported-files link-preview-item">
                            <div className="unsupported-file-first-div">
                                <Link />
                                <div className="vertical-line"></div>
                            </div>
                            <a className="file-preview-name link-text" href={link} target="_blank" rel="noreferrer" title={link}>{link}</a>
                            <div className="unsupported-file-last-div">
                                <div className="unsupported-delete-icon" onClick={() => handleRemoveLink(link)}>
                                    <CloseIcon />
                                </div>
                            </div>
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

                        {/* Topic / Category Selector */}
                        {isTeacherOrAdmin && (
                            <div style={{ marginLeft: '4px', marginRight: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                <TopicDropdown
                                    selectedTopic={categoryId}
                                    onSelectTopic={(topicId) => handleCategoryChange({ target: { value: topicId || "" } })}
                                    defaultLabel="No topic"
                                    emptyValue=""
                                    allowCreate={true}
                                    allowDelete={false}
                                    triggerStyle={{ height: '36px', minWidth: '135px', padding: '0 10px', fontSize: '13px' }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="right-side-controllers">
                        <button className="button-cancel" onClick={handleClose} disabled={loading}>
                            Cancel
                        </button>
                        <button className="button-post" onClick={handlePost} disabled={loading}>
                            {loading ? "Posting..." : <>Post <IoIosSend /></>}
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
    const currClass = useSelector((state) => state?.classes?.currClass);
    const currUser = useSelector((state) => state?.auth?.user);

    const isTeacherOrAdmin = (currClass?.admin && (currClass.admin._id === currUser?._id || currClass.admin === currUser?._id)) ||
        (currClass?.teacher && Array.isArray(currClass.teacher) && currClass.teacher.some(t => (t?._id === currUser?._id || t === currUser?._id)));
    const isStudent = currClass?.student && Array.isArray(currClass.student) && currClass.student.some(s => (s?._id === currUser?._id || s === currUser?._id));

    const [writeAssignment, setWriteAssignment] = useState(false);
    const [isPost, setIsPost] = useState(true);
    const dispatch = useDispatch();
    const [data, setdata] = useState({
        currClassId: currClass?._id || "",
        title: "",
        text: "",
        links: [],
        files: [],
        youtubeLinks: [],
        dueDate: "",
        categoryId: "",
        acceptAfterDue: true
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

    const handleDueDateChange = (e) => {
        setdata(prev => ({
            ...prev,
            dueDate: e.target.value
        }));
    };

    const handleCategoryChange = (e) => {
        setdata(prev => ({
            ...prev,
            categoryId: e.target.value
        }));
    };

    const handleClose = () => {
        setWriteAssignment(false);
        setdata({ title: "", text: "", links: [], files: [], youtubeLinks: [], categoryId: "" });
    };

    const loading = useSelector((state) => state.loading.loading);

    const handlePost = async () => {
        dispatch(setLoading(true));
        try {
            const formData = new FormData();

            if (isPost) {
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
                if (data.categoryId) {
                    formData.append('category', data.categoryId);
                }

                const response = await dispatch(createPost(formData)).unwrap();

                if (response && response.success) {
                    if (response.data) {
                        dispatch(updateCurrClass({
                            addedPost: [response.data, ...(currClass.addedPost || [])]
                        }));
                    }
                    setdata((prev) => ({
                        ...prev,
                        title: "",
                        text: "",
                        links: [],
                        files: [],
                        youtubeLinks: [],
                        dueDate: "",
                        categoryId: ""
                    }));
                    setWriteAssignment(false);
                }
            } else {
                if (data.files.length > 0) formData.append("file", data.files[0].file);
                formData.append('name', data.title);
                formData.append('description', data.text);
                formData.append('currClassId', currClass._id);
                formData.append('status', 'Published');
                formData.append('acceptAfterDue', data.acceptAfterDue);
                if (data.dueDate) {
                    formData.append('dueDate', data.dueDate);
                } else {
                    const defaultDate = new Date();
                    defaultDate.setDate(defaultDate.getDate() + 7);
                    formData.append('dueDate', defaultDate.toISOString());
                }
                if (data.categoryId) {
                    formData.append('category', data.categoryId);
                }

                const response = await dispatch(createAssignment(formData)).unwrap();

                if (response && response.success) {
                    const newAssignment = response.newAss || response.data;
                    if (newAssignment) {
                        dispatch(updateCurrClass({
                            addedAssignment: [newAssignment, ...(currClass.addedAssignment || [])]
                        }));
                    }
                    setdata((prev) => ({
                        ...prev,
                        title: "",
                        text: "",
                        links: [],
                        files: [],
                        youtubeLinks: [],
                        dueDate: "",
                        categoryId: ""
                    }));
                    setWriteAssignment(false);
                }
            }
        } catch (err) {
            console.error("Error During Posting Announcement", err);
        }
        dispatch(setLoading(false));
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

        setdata(prev => {
            const existingNames = new Set(prev.files.map(f => f.name));
            const filteredNewFiles = newFiles.filter(f => !existingNames.has(f.name));

            if (filteredNewFiles.length < newFiles.length) {
                toast.error("Duplicate files not allowed");
            }

            return {
                ...prev,
                files: [...prev.files, ...filteredNewFiles]
            };
        });
    };

    const handleDeleteFile = (fileName) => {
        setdata(prev => ({
            ...prev,
            files: prev.files.filter((file) => file.name !== fileName)
        }));
    };

    const handleLinkSubmit = (url) => {
        setdata(prev => {
            if (prev.links.includes(url)) {
                toast.error("Duplicate links not allowed");
                return prev;
            }
            return {
                ...prev,
                links: [...prev.links, url]
            };
        });
    };

    const handleYouTubeLinkSubmit = (url) => {
        let videoId = null;
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.hostname === 'youtu.be') {
                videoId = parsedUrl.pathname.slice(1);
            } else if (parsedUrl.hostname.includes('youtube.com')) {
                if (parsedUrl.pathname.startsWith('/embed/')) {
                    videoId = parsedUrl.pathname.split('/')[2];
                } else if (parsedUrl.pathname.startsWith('/shorts/')) {
                    videoId = parsedUrl.pathname.split('/')[2];
                } else {
                    videoId = parsedUrl.searchParams.get("v");
                }
            }
        } catch (e) {
            toast.error("Invalid YouTube URL. Please paste a valid YouTube link.");
        }

        if (videoId) {
            setdata(prev => {
                if (prev.youtubeLinks.includes(videoId)) {
                    toast.error("Duplicate YouTube videos not allowed");
                    return prev;
                }
                return {
                    ...prev,
                    youtubeLinks: [...prev.youtubeLinks, videoId]
                };
            });
        }
    };


    const handleCreateInlineCategory = useCallback(async (name) => {
        try {
            const response = await dispatch(createCategory({ name, classId: currClass._id })).unwrap();
            if (response && response.data) {
                // Topic created successfully
                dispatch(updateCurrClass({
                    addedCategory: [...(currClass.addedCategory || []), response.data]
                }));
                setdata(prev => ({ ...prev, categoryId: response.data._id }));
            }
        } catch (err) {
            console.error("Error creating inline topic", err);
        }
    }, [currClass?._id, currClass?.addedCategory, dispatch]);

    // Keep it on window temporarily for the inline onClick (or pass it properly in the DOM event)
    useEffect(() => {
        window.handleCreateInlineCategory = handleCreateInlineCategory;
        return () => {
            delete window.handleCreateInlineCategory;
        };
    }, [handleCreateInlineCategory]);

    if (isStudent && currClass.studentCanPost === false) {
        return null; // Hide the announcement box completely
    }

    return (
        <div className="main-announcement-container">
            <div className="announce-something-container">
                <UserAnnouncementHeader setWriteAssignment={setWriteAssignment} />
                {writeAssignment && (
                    <AnnouncementWriter
                        isTeacherOrAdmin={isTeacherOrAdmin}
                        isPost={isTeacherOrAdmin ? isPost : true}
                        title={data.title}
                        announcement={data.text}
                        dueDate={data.dueDate}
                        categoryId={data.categoryId}
                        links={data.links}
                        youtubeLinks={data.youtubeLinks}
                        handleTitleChange={handleTitleChange}
                        handleAnnouncementChange={handleAnnouncementChange}
                        handleDueDateChange={handleDueDateChange}
                        handleCategoryChange={handleCategoryChange}
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
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
}
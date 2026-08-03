import React, { useState, useRef, useEffect } from "react";
import {
    Dialog,
    TextField,
    IconButton,
    CircularProgress,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";
import {
    Close as CloseIcon,
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    CloudUpload,
    YouTube,
    Link as LinkIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from "@mui/icons-material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { useDispatch, useSelector } from "react-redux";
import { editPost } from "../../../Api/apiCaller/postapicaller";
import { updateCurrClass } from "../../../Slices/classSlice";
import TopicDropdown from "../../Helper/TopicDropdown";
import toast from "react-hot-toast";
import "./editPostModal.css";

export default function EditPostModal({ open, onClose, post, onPostUpdated }) {
    const dispatch = useDispatch();
    const currClass = useSelector((state) => state.classes.currClass);

    // Controlled form states initialized from post prop
    const [title, setTitle] = useState(post?.title || "");
    const [content, setContent] = useState(post?.postBody || "");
    const [category, setCategory] = useState(post?.category || "");
    const [existingFiles, setExistingFiles] = useState(post?.postFiles || []);
    const [newFiles, setNewFiles] = useState([]);
    const [links, setLinks] = useState(post?.links || []);
    const [youtubeLinks, setYoutubeLinks] = useState(post?.youtubeLinks || []);

    // Link & YouTube input toggle states
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [showYouTubeInput, setShowYouTubeInput] = useState(false);
    const [newYouTubeUrl, setNewYouTubeUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    // Sync state whenever modal opens or post changes
    useEffect(() => {
        if (open && post) {
            setTitle(post.title || "");
            setContent(post.postBody || "");
            setCategory(post.category || "");
            setExistingFiles(post.postFiles || []);
            setNewFiles([]);
            setLinks(post.links || []);
            setYoutubeLinks(post.youtubeLinks || []);
            setShowLinkInput(false);
            setShowYouTubeInput(false);
            if (editorRef.current) {
                editorRef.current.innerHTML = post.postBody || "";
            }
        }
    }, [open, post]);

    useEffect(() => {
        window.handleCreateInlineCategoryEditPost = async (name) => {
            try {
                // We need to import createCategory at the top
                const { createCategory } = require("../../../Api/apiCaller/categoryapicaller");
                const response = await dispatch(createCategory({ name, classId: currClass._id })).unwrap();
                if (response && response.data) {
                    dispatch(updateCurrClass({
                        addedCategory: [...(currClass.addedCategory || []), response.data]
                    }));
                    setCategory(response.data._id);
                }
            } catch (err) {
                console.error("Error creating inline topic", err);
            }
        };
        return () => {
            delete window.handleCreateInlineCategoryEditPost;
        };
    }, [currClass?._id, currClass?.addedCategory, dispatch]);

    const handleApplyFormatting = (command) => {
        document.execCommand(command, false, null);
    };

    const handleContentInput = () => {
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    };

    // --- File Handlers ---
    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        const mapped = selected.map((file) => ({
            file,
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
        }));

        setNewFiles((prev) => {
            const existingNewNames = new Set(prev.map((f) => f.name));
            const existingSavedNames = new Set(existingFiles.map((f) => f.fileName));

            const unique = mapped.filter(
                (f) => !existingNewNames.has(f.name) && !existingSavedNames.has(f.name)
            );

            if (unique.length < mapped.length) {
                toast.error("Duplicate files were skipped");
            }
            return [...prev, ...unique];
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveExistingFile = (fileName) => {
        setExistingFiles((prev) => prev.filter((f) => f.fileName !== fileName));
    };

    const handleRemoveNewFile = (fileName) => {
        setNewFiles((prev) => prev.filter((f) => f.name !== fileName));
    };

    // --- Link Handlers ---
    const handleAddLink = (e) => {
        e.preventDefault();
        const trimmed = newLinkUrl.trim();
        if (!trimmed) return;
        if (links.includes(trimmed)) {
            toast.error("Link is already added");
            return;
        }
        setLinks((prev) => [...prev, trimmed]);
        setNewLinkUrl("");
        setShowLinkInput(false);
    };

    const handleRemoveLink = (urlToRemove) => {
        setLinks((prev) => prev.filter((l) => l !== urlToRemove));
    };

    // --- YouTube Handlers ---
    const handleAddYouTubeLink = (e) => {
        e.preventDefault();
        const trimmed = newYouTubeUrl.trim();
        if (!trimmed) return;
        if (youtubeLinks.includes(trimmed)) {
            toast.error("YouTube video is already added");
            return;
        }
        setYoutubeLinks((prev) => [...prev, trimmed]);
        setNewYouTubeUrl("");
        setShowYouTubeInput(false);
    };

    const handleRemoveYouTubeLink = (urlToRemove) => {
        setYoutubeLinks((prev) => prev.filter((y) => y !== urlToRemove));
    };

    const cleanFileName = (fileName) => {
        if (!fileName) return "";
        const parts = fileName.split("|");
        return parts.length > 1 ? parts[0] + "." + fileName.split(".").pop() : fileName;
    };

    // --- Submit Edit Post ---
    const handleSave = async () => {
        const trimmedTitle = title.trim();
        const strippedContent = (editorRef.current ? editorRef.current.innerHTML : content)
            .replace(/<[^>]*>/g, "")
            .trim();

        if (!trimmedTitle) {
            toast.error("Please provide a title for the post");
            return;
        }

        if (!strippedContent && !content.includes("<img")) {
            toast.error("Post content cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("title", trimmedTitle);
            formData.append("text", editorRef.current ? editorRef.current.innerHTML : content);
            formData.append("category", category || "");
            formData.append("existingFiles", JSON.stringify(existingFiles));

            // Append Web Links
            links.forEach((l) => formData.append("links", l));

            // Append YouTube Links
            youtubeLinks.forEach((y) => formData.append("youtubeLinks", y));

            // Append New Upload Files
            newFiles.forEach((f) => {
                formData.append("files", f.file);
            });

            const resultAction = await dispatch(editPost({ postId: post._id, data: formData }));

            if (editPost.fulfilled.match(resultAction)) {
                const updatedData = resultAction.payload?.data || resultAction.payload;

                // Update Redux state if currClass exists
                if (currClass && currClass.addedPost) {
                    const updatedPosts = currClass.addedPost.map((p) =>
                        p._id === post._id ? { ...p, ...updatedData } : p
                    );
                    dispatch(updateCurrClass({ addedPost: updatedPosts }));
                }

                if (onPostUpdated) {
                    onPostUpdated(updatedData);
                }

                onClose();
            }
        } catch (err) {
            console.error("Error saving edited post:", err);
            toast.error(err?.message || "An unexpected error occurred while saving post");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={!isSaving ? onClose : undefined}
            className="edit-post-dialog"
            fullWidth
            maxWidth="md"
        >
            <div className="edit-post-modal-container">
                {/* Header */}
                <div className="edit-post-modal-header">
                    <h3>
                        <EditIcon fontSize="small" style={{ color: "var(--class-theme, #1967d2)" }} />
                        Edit Post
                    </h3>
                    <IconButton
                        size="small"
                        onClick={onClose}
                        disabled={isSaving}
                        className="close-btn"
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                {/* Body */}
                <div className="edit-post-modal-body">
                    {/* Post Title */}
                    <TextField
                        placeholder="Post Title"
                        variant="outlined"
                        size="small"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="edit-post-title-input"
                        fullWidth
                        disabled={isSaving}
                    />



                    {/* Rich Content Editor */}
                    <div
                        ref={editorRef}
                        contentEditable={!isSaving}
                        className="edit-post-content-editor"
                        placeholder="Write your announcement or update..."
                        onInput={handleContentInput}
                        dir="ltr"
                    />

                    {/* Formatting Toolbar & Attachment Triggers */}
                    <div className="edit-post-toolbar">
                        <div className="edit-post-toolbar-left">
                            <IconButton
                                size="small"
                                onClick={() => handleApplyFormatting("bold")}
                                title="Bold"
                                disabled={isSaving}
                            >
                                <FormatBold fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => handleApplyFormatting("italic")}
                                title="Italic"
                                disabled={isSaving}
                            >
                                <FormatItalic fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => handleApplyFormatting("underline")}
                                title="Underline"
                                disabled={isSaving}
                            >
                                <FormatUnderlined fontSize="small" />
                            </IconButton>
                        </div>

                        <div className="edit-post-toolbar-right">
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                                accept=".jpg,.jpeg,.png,.pdf"
                                disabled={isSaving}
                            />
                            <IconButton
                                size="small"
                                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                title="Upload files"
                                disabled={isSaving}
                            >
                                <CloudUpload fontSize="small" style={{ color: "#8b5cf6" }} />
                            </IconButton>

                            {/* Topic / Category Selector */}
                            {currClass?.admin && (
                                <div style={{ marginLeft: '4px', marginRight: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                    <TopicDropdown
                                        selectedTopic={category}
                                        onSelectTopic={(topicId) => setCategory(topicId || "")}
                                        defaultLabel="No topic"
                                        emptyValue=""
                                        allowCreate={true}
                                        allowDelete={false}
                                        disabled={isSaving}
                                        triggerStyle={{ height: '36px', minWidth: '135px', padding: '0 10px', fontSize: '13px' }}
                                    />
                                </div>
                            )}
                            <IconButton
                                size="small"
                                onClick={() => setShowYouTubeInput((prev) => !prev)}
                                title="Add YouTube video"
                                disabled={isSaving}
                            >
                                <YouTube fontSize="small" style={{ color: "#ef4444" }} />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => setShowLinkInput((prev) => !prev)}
                                title="Add Link"
                                disabled={isSaving}
                            >
                                <LinkIcon fontSize="small" style={{ color: "#059669" }} />
                            </IconButton>
                        </div>
                    </div>

                    {/* YouTube Link Input Modal/Box */}
                    {showYouTubeInput && (
                        <form onSubmit={handleAddYouTubeLink} style={{ display: "flex", gap: "8px" }}>
                            <TextField
                                size="small"
                                placeholder="Paste YouTube link (e.g., https://youtube.com/watch?v=...)"
                                value={newYouTubeUrl}
                                onChange={(e) => setNewYouTubeUrl(e.target.value)}
                                fullWidth
                                autoFocus
                            />
                            <Button
                                variant="contained"
                                size="small"
                                type="submit"
                                style={{
                                    backgroundColor: "#ef4444",
                                    color: "#fff",
                                    textTransform: "none"
                                }}
                            >
                                Add
                            </Button>
                            <Button
                                size="small"
                                onClick={() => setShowYouTubeInput(false)}
                                style={{ color: "#64748b", textTransform: "none" }}
                            >
                                Cancel
                            </Button>
                        </form>
                    )}

                    {/* Web Link Input Modal/Box */}
                    {showLinkInput && (
                        <form onSubmit={handleAddLink} style={{ display: "flex", gap: "8px" }}>
                            <TextField
                                size="small"
                                placeholder="Enter link (e.g., https://example.com)"
                                value={newLinkUrl}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                fullWidth
                                autoFocus
                            />
                            <Button
                                variant="contained"
                                size="small"
                                type="submit"
                                style={{
                                    backgroundColor: "var(--class-theme, #1967d2)",
                                    color: "#fff",
                                    textTransform: "none"
                                }}
                            >
                                Add
                            </Button>
                            <Button
                                size="small"
                                onClick={() => setShowLinkInput(false)}
                                style={{ color: "#64748b", textTransform: "none" }}
                            >
                                Cancel
                            </Button>
                        </form>
                    )}

                    {/* Existing Attachments Section */}
                    {existingFiles.length > 0 && (
                        <div>
                            <div className="edit-post-section-label">Current Attachments</div>
                            <div className="edit-post-attachments-grid">
                                {existingFiles.map((file) => {
                                    const isPdf = file.fileType === "pdf" || file.fileUrl?.endsWith(".pdf");
                                    return (
                                        <div className="edit-post-file-card" key={file.fileName}>
                                            {isPdf ? (
                                                <PictureAsPdfRoundedIcon style={{ color: "#ef4444", fontSize: 32 }} />
                                            ) : (
                                                <img
                                                    src={file.fileUrl}
                                                    alt="Preview"
                                                    className="edit-post-file-thumb"
                                                />
                                            )}
                                            <span className="edit-post-file-name" title={file.fileName}>
                                                {cleanFileName(file.fileName)}
                                            </span>
                                            <div
                                                className="edit-post-file-remove"
                                                onClick={() => handleRemoveExistingFile(file.fileName)}
                                                title="Remove file"
                                            >
                                                <CloseIcon fontSize="small" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* New Uploads Preview Section */}
                    {newFiles.length > 0 && (
                        <div>
                            <div className="edit-post-section-label">New Files to Upload</div>
                            <div className="edit-post-attachments-grid">
                                {newFiles.map((file) => {
                                    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
                                    return (
                                        <div className="edit-post-file-card" key={file.name}>
                                            {isPdf ? (
                                                <PictureAsPdfRoundedIcon style={{ color: "#ef4444", fontSize: 32 }} />
                                            ) : (
                                                <img
                                                    src={file.url}
                                                    alt="Preview"
                                                    className="edit-post-file-thumb"
                                                />
                                            )}
                                            <span className="edit-post-file-name" title={file.name}>
                                                {file.name}
                                            </span>
                                            <div
                                                className="edit-post-file-remove"
                                                onClick={() => handleRemoveNewFile(file.name)}
                                                title="Remove file"
                                            >
                                                <CloseIcon fontSize="small" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* YouTube Links List */}
                    {youtubeLinks.length > 0 && (
                        <div>
                            <div className="edit-post-section-label">YouTube Videos</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {youtubeLinks.map((yLink) => (
                                    <div className="edit-post-link-item" key={yLink}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                                            <YouTube style={{ color: "#ef4444", fontSize: 20 }} />
                                            <span style={{ fontSize: "0.85rem", color: "#334155" }}>{yLink}</span>
                                        </div>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveYouTubeLink(yLink)}
                                            color="error"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Web Links List */}
                    {links.length > 0 && (
                        <div>
                            <div className="edit-post-section-label">Web Links</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {links.map((link) => (
                                    <div className="edit-post-link-item" key={link}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                                            <LinkIcon style={{ color: "#059669", fontSize: 20 }} />
                                            <a href={link.startsWith("http") ? link : `https://${link}`} target="_blank" rel="noreferrer">
                                                {link}
                                            </a>
                                        </div>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveLink(link)}
                                            color="error"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="edit-post-modal-footer">
                    <button
                        type="button"
                        className="edit-post-btn-cancel"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="edit-post-btn-save"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <CircularProgress size={16} color="inherit" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}

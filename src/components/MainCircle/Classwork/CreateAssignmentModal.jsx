import React, { useState, useRef } from "react";
import {
    Dialog,
    TextField,
    IconButton,
    CircularProgress,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormControlLabel,
    Switch,
    Tooltip
} from "@mui/material";
import {
    Close as CloseIcon,
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    CloudUpload,
    Assignment as AssignmentIcon,
    YouTube,
    Link as LinkIcon,
    Delete as DeleteIcon,
    EventBusy as EventBusyIcon
} from "@mui/icons-material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { useDispatch, useSelector } from "react-redux";
import { createAssignment } from "../../../Api/apiCaller/assignmentapicaller";
import { updateCurrClass } from "../../../Slices/classSlice";
import TopicDropdown from "../../Helper/TopicDropdown";
import toast from "react-hot-toast";
import "../MainCircleWorkingArea/editAssignmentModal.css";

export default function CreateAssignmentModal({ open, onClose, defaultCategoryId = "", onAssignmentCreated }) {
    const dispatch = useDispatch();
    const currClass = useSelector((state) => state.classes.currClass);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(defaultCategoryId || "");
    const [dueDate, setDueDate] = useState("");
    const [totalMarks, setTotalMarks] = useState(100);
    const [acceptAfterDue, setAcceptAfterDue] = useState(true);
    const [status, setStatus] = useState("Published");
    
    // Attachments
    const [files, setFiles] = useState([]);
    const [links, setLinks] = useState([]);
    const [youtubeLinks, setYoutubeLinks] = useState([]);

    // Input toggles
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [newLinkUrl, setNewLinkUrl] = useState("");
    const [showYouTubeInput, setShowYouTubeInput] = useState(false);
    const [newYouTubeUrl, setNewYouTubeUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    const resetForm = () => {
        setName("");
        setDescription("");
        setCategory(defaultCategoryId || "");
        setDueDate("");
        setTotalMarks(100);
        setAcceptAfterDue(true);
        setStatus("Published");
        setFiles([]);
        setLinks([]);
        setYoutubeLinks([]);
        setShowLinkInput(false);
        setShowYouTubeInput(false);
        setNewLinkUrl("");
        setNewYouTubeUrl("");
        if (editorRef.current) {
            editorRef.current.innerHTML = "";
        }
    };

    const handleClose = () => {
        if (!isSaving) {
            resetForm();
            onClose();
        }
    };

    const handleApplyFormatting = (command) => {
        document.execCommand(command, false, null);
    };

    const handleContentInput = () => {
        if (editorRef.current) {
            setDescription(editorRef.current.innerHTML);
        }
    };

    // --- File Handlers ---
    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files || []);
        const mapped = selected.map((file) => ({
            file,
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
        }));

        setFiles((prev) => {
            const existingNames = new Set(prev.map((f) => f.name));
            const unique = mapped.filter((f) => !existingNames.has(f.name));
            if (unique.length < mapped.length) {
                toast.error("Duplicate files were skipped");
            }
            return [...prev, ...unique];
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveFile = (fileName) => {
        setFiles((prev) => prev.filter((f) => f.name !== fileName));
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

    const handleClearDueDate = () => {
        setDueDate("");
    };

    // --- Submit Create Assignment ---
    const handleSave = async () => {
        const trimmedName = name.trim();
        const rawContent = editorRef.current ? editorRef.current.innerHTML : description;
        const strippedContent = rawContent.replace(/<[^>]*>/g, "").trim();

        if (!trimmedName) {
            toast.error("Please provide an assignment title");
            return;
        }

        if (!strippedContent && !rawContent.includes("<img")) {
            toast.error("Assignment instructions cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", trimmedName);
            formData.append("description", rawContent);
            formData.append("currClassId", currClass._id);
            formData.append("category", category || "");
            formData.append("totalMarks", totalMarks !== "" ? totalMarks : 100);
            formData.append("acceptAfterDue", acceptAfterDue);
            formData.append("status", status);

            if (dueDate) {
                formData.append("dueDate", new Date(dueDate).toISOString());
            } else {
                const defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() + 7);
                formData.append("dueDate", defaultDate.toISOString());
            }

            // Web links
            links.forEach((l) => formData.append("links", l));

            // YouTube links
            youtubeLinks.forEach((y) => formData.append("youtubeLinks", y));

            // Multi Files
            files.forEach((f) => {
                formData.append("files", f.file);
            });

            // Legacy single file fallback
            if (files.length === 1) {
                formData.append("file", files[0].file);
            }

            const res = await dispatch(createAssignment(formData)).unwrap();

            if (res && res.success) {
                const newAss = res.newAss || res.data;
                if (newAss && currClass) {
                    dispatch(updateCurrClass({
                        addedAssignment: [newAss, ...(currClass.addedAssignment || [])]
                    }));
                }
                if (onAssignmentCreated) {
                    onAssignmentCreated(newAss);
                }
                resetForm();
                onClose();
            }
        } catch (err) {
            console.error("Error creating assignment:", err);
            toast.error(err?.message || "Failed to create assignment");
        } finally {
            setIsSaving(false);
        }
    };

    const themeColor = currClass?.classTheme || "#00a896";

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            className="edit-assignment-dialog"
            fullWidth
            maxWidth="md"
        >
            <div className="edit-assignment-modal-container">
                {/* Header */}
                <div className="edit-assignment-modal-header">
                    <div className="modal-title-group">
                        <div className="modal-icon-badge" style={{ backgroundColor: themeColor }}>
                            <AssignmentIcon fontSize="small" />
                        </div>
                        <h3>Create Assignment</h3>
                    </div>
                    <IconButton
                        size="small"
                        onClick={handleClose}
                        disabled={isSaving}
                        className="close-btn"
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                {/* Body */}
                <div className="edit-assignment-modal-body">
                    {/* Title */}
                    <div className="input-group">
                        <TextField
                            placeholder="Assignment Title"
                            variant="outlined"
                            size="small"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="edit-assignment-title-input"
                            fullWidth
                            autoFocus
                            disabled={isSaving}
                        />
                    </div>

                    {/* Rich Content Editor */}
                    <div className="editor-wrapper">
                        <div
                            ref={editorRef}
                            contentEditable={!isSaving}
                            className="edit-assignment-content-editor"
                            placeholder="Assignment instructions (optional or detailed steps)..."
                            onInput={handleContentInput}
                            dir="ltr"
                        />

                        {/* Toolbar */}
                        <div className="edit-assignment-toolbar">
                            <div className="toolbar-left">
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

                            <div className="toolbar-right">
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.zip,.txt"
                                    disabled={isSaving}
                                />
                                <Tooltip title="Attach Files">
                                    <IconButton
                                        size="small"
                                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                        disabled={isSaving}
                                        style={{ color: "#8b5cf6" }}
                                    >
                                        <CloudUpload fontSize="small" />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Add YouTube Video">
                                    <IconButton
                                        size="small"
                                        onClick={() => setShowYouTubeInput((prev) => !prev)}
                                        disabled={isSaving}
                                        style={{ color: "#ef4444" }}
                                    >
                                        <YouTube fontSize="small" />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Add Web Link">
                                    <IconButton
                                        size="small"
                                        onClick={() => setShowLinkInput((prev) => !prev)}
                                        disabled={isSaving}
                                        style={{ color: "#059669" }}
                                    >
                                        <LinkIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* YouTube Inline Input Box */}
                    {showYouTubeInput && (
                        <form onSubmit={handleAddYouTubeLink} className="inline-add-input-form">
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
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: "8px",
                                    px: 2
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

                    {/* Web Link Inline Input Box */}
                    {showLinkInput && (
                        <form onSubmit={handleAddLink} className="inline-add-input-form">
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
                                    backgroundColor: themeColor,
                                    color: "#fff",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: "8px",
                                    px: 2
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

                    {/* Assignment Configuration Grid */}
                    <div className="assignment-meta-grid">
                        {/* Due Date & Time */}
                        <div className="meta-field due-date-field-wrapper">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <TextField
                                    label="Due Date & Time"
                                    type="datetime-local"
                                    size="small"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    disabled={isSaving}
                                />
                                {dueDate && (
                                    <Tooltip title="Clear due date">
                                        <IconButton size="small" onClick={handleClearDueDate} sx={{ color: '#94a3b8' }}>
                                            <EventBusyIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </div>
                        </div>

                        {/* Points / Total Marks */}
                        <div className="meta-field">
                            <TextField
                                label="Points / Total Marks"
                                type="number"
                                size="small"
                                value={totalMarks}
                                onChange={(e) => setTotalMarks(e.target.value)}
                                inputProps={{ min: 0, max: 1000 }}
                                fullWidth
                                disabled={isSaving}
                                sx={{ backgroundColor: '#fff' }}
                            />
                        </div>

                        {/* Topic Selector */}
                        <div className="meta-field">
                            <TopicDropdown
                                selectedTopic={category}
                                onSelectTopic={(topicId) => setCategory(topicId || "")}
                                defaultLabel="No topic"
                                emptyValue=""
                                allowCreate={true}
                                allowDelete={false}
                                disabled={isSaving}
                                style={{ width: "100%" }}
                                triggerStyle={{ width: "100%", height: "40px", backgroundColor: "#fff" }}
                            />
                        </div>

                        {/* Status Selector */}
                        <div className="meta-field">
                            <FormControl size="small" fullWidth>
                                <InputLabel id="create-ass-status-label">Status</InputLabel>
                                <Select
                                    labelId="create-ass-status-label"
                                    id="create-ass-status-select"
                                    value={status}
                                    label="Status"
                                    onChange={(e) => setStatus(e.target.value)}
                                    disabled={isSaving}
                                    sx={{ backgroundColor: '#fff' }}
                                >
                                    <MenuItem value="Published">Published</MenuItem>
                                    <MenuItem value="Draft">Draft</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        {/* Late Submissions Toggle */}
                        <div className="meta-field toggle-field">
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={acceptAfterDue}
                                        onChange={(e) => setAcceptAfterDue(e.target.checked)}
                                        color="primary"
                                        disabled={isSaving}
                                    />
                                }
                                label="Allow Late Submissions"
                                sx={{
                                    '& .MuiTypography-root': {
                                        fontSize: '13.5px',
                                        fontWeight: 500,
                                        color: '#334155'
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Files Preview Section */}
                    {files.length > 0 && (
                        <div className="attachment-preview-section">
                            <div className="attachment-section-title">Attached Files ({files.length})</div>
                            <div className="edit-assignment-files-grid">
                                {files.map((file) => {
                                    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
                                    const isImg = file.type?.startsWith("image/");
                                    return (
                                        <div className="attachment-file-card new-file" key={file.name}>
                                            {isImg ? (
                                                <img
                                                    src={file.url}
                                                    alt="Preview"
                                                    className="edit-assignment-file-thumb"
                                                />
                                            ) : isPdf ? (
                                                <PictureAsPdfRoundedIcon style={{ color: "#ef4444", fontSize: 28 }} />
                                            ) : (
                                                <PictureAsPdfRoundedIcon style={{ color: themeColor, fontSize: 28 }} />
                                            )}
                                            <span className="attachment-link" title={file.name}>{file.name}</span>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveFile(file.name)}
                                                title="Remove file"
                                                className="remove-file-btn"
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* YouTube Videos List */}
                    {youtubeLinks.length > 0 && (
                        <div className="attachment-preview-section">
                            <div className="attachment-section-title">YouTube Videos ({youtubeLinks.length})</div>
                            <div className="links-list-container">
                                {youtubeLinks.map((yLink) => (
                                    <div className="edit-link-item-row" key={yLink}>
                                        <div className="link-item-left">
                                            <YouTube style={{ color: "#ef4444", fontSize: 20 }} />
                                            <span className="link-item-text">{yLink}</span>
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
                        <div className="attachment-preview-section">
                            <div className="attachment-section-title">Web Links ({links.length})</div>
                            <div className="links-list-container">
                                {links.map((link) => (
                                    <div className="edit-link-item-row" key={link}>
                                        <div className="link-item-left">
                                            <LinkIcon style={{ color: "#059669", fontSize: 20 }} />
                                            <a
                                                href={link.startsWith("http") ? link : `https://${link}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="link-item-anchor"
                                            >
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
                <div className="edit-assignment-modal-footer">
                    <button
                        type="button"
                        className="modal-btn-cancel"
                        onClick={handleClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="modal-btn-save"
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{ backgroundColor: themeColor }}
                    >
                        {isSaving ? (
                            <>
                                <CircularProgress size={16} color="inherit" />
                                Creating...
                            </>
                        ) : (
                            "Assign"
                        )}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}


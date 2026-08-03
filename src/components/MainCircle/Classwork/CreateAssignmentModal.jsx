import React, { useState, useRef, useCallback } from "react";
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
    Switch
} from "@mui/material";
import {
    Close as CloseIcon,
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    CloudUpload,
    Assignment as AssignmentIcon
} from "@mui/icons-material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { useDispatch, useSelector } from "react-redux";
import { createAssignment } from "../../../Api/apiCaller/assignmentapicaller";
import { createCategory } from "../../../Api/apiCaller/categoryapicaller";
import { updateCurrClass } from "../../../Slices/classSlice";
import toast from "react-hot-toast";
import "../MainCircleWorkingArea/editAssignmentModal.css";

export default function CreateAssignmentModal({ open, onClose, defaultCategoryId = "", onAssignmentCreated }) {
    const dispatch = useDispatch();
    const currClass = useSelector((state) => state.classes.currClass);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(defaultCategoryId || "");
    const [dueDate, setDueDate] = useState("");
    const [acceptAfterDue, setAcceptAfterDue] = useState(true);
    const [status, setStatus] = useState("Published");
    
    const [file, setFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    const resetForm = () => {
        setName("");
        setDescription("");
        setCategory(defaultCategoryId || "");
        setDueDate("");
        setAcceptAfterDue(true);
        setStatus("Published");
        setFile(null);
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

    const handleCreateInlineTopic = useCallback(async (topicName) => {
        if (!topicName || !topicName.trim()) return;
        try {
            const response = await dispatch(createCategory({ name: topicName.trim(), classId: currClass._id })).unwrap();
            if (response && response.data) {
                dispatch(updateCurrClass({
                    addedCategory: [...(currClass.addedCategory || []), response.data]
                }));
                setCategory(response.data._id);
                toast.success(`Topic "${topicName.trim()}" created`);
            }
        } catch (err) {
            console.error("Error creating inline topic", err);
        }
    }, [currClass?._id, currClass?.addedCategory, dispatch]);

    const handleApplyFormatting = (command) => {
        document.execCommand(command, false, null);
    };

    const handleContentInput = () => {
        if (editorRef.current) {
            setDescription(editorRef.current.innerHTML);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

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
            formData.append("acceptAfterDue", acceptAfterDue);
            formData.append("status", status);

            if (dueDate) {
                formData.append("dueDate", new Date(dueDate).toISOString());
            } else {
                const defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() + 7);
                formData.append("dueDate", defaultDate.toISOString());
            }

            if (file) {
                formData.append("file", file);
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
        } finally {
            setIsSaving(false);
        }
    };

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
                        <div className="modal-icon-badge" style={{ backgroundColor: currClass?.classTheme || '#00a896' }}>
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
                            data-placeholder="Assignment instructions (optional or detailed steps)..."
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
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    disabled={isSaving}
                                />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<CloudUpload fontSize="small" />}
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    disabled={isSaving}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '13px',
                                        borderColor: '#e2e8f0',
                                        color: '#475569',
                                        '&:hover': {
                                            borderColor: currClass?.classTheme || '#00a896',
                                            backgroundColor: '#f8fafc'
                                        }
                                    }}
                                >
                                    Attach File
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Controls Grid */}
                    <div className="assignment-meta-grid">
                        {/* Due Date & Time */}
                        <div className="meta-field">
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
                        </div>

                        {/* Topic Selector */}
                        <div className="meta-field">
                            {category !== "CREATE_NEW" ? (
                                <FormControl size="small" fullWidth>
                                    <InputLabel id="create-ass-topic-label">Topic</InputLabel>
                                    <Select
                                        labelId="create-ass-topic-label"
                                        id="create-ass-topic-select"
                                        value={category}
                                        label="Topic"
                                        onChange={(e) => setCategory(e.target.value)}
                                        disabled={isSaving}
                                        sx={{ backgroundColor: '#fff' }}
                                    >
                                        <MenuItem value="">
                                            <em>No topic</em>
                                        </MenuItem>
                                        {currClass?.addedCategory && currClass.addedCategory.map((cat) => (
                                            <MenuItem key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </MenuItem>
                                        ))}
                                        <MenuItem value="CREATE_NEW" sx={{ color: currClass?.classTheme || '#00a896', fontWeight: 600 }}>
                                            + Create new topic
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            ) : (
                                <div className="inline-topic-input-container">
                                    <input
                                        type="text"
                                        placeholder="New topic name..."
                                        id="create-ass-inline-topic"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const input = document.getElementById("create-ass-inline-topic");
                                                if (input?.value.trim()) {
                                                    handleCreateInlineTopic(input.value.trim());
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        style={{ backgroundColor: currClass?.classTheme || '#00a896' }}
                                        onClick={() => {
                                            const input = document.getElementById("create-ass-inline-topic");
                                            if (input?.value.trim()) {
                                                handleCreateInlineTopic(input.value.trim());
                                            }
                                        }}
                                    >
                                        Save
                                    </Button>
                                    <IconButton size="small" onClick={() => setCategory("")}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </div>
                            )}
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
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        color: '#334155'
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Attached File Preview */}
                    {file && (
                        <div className="attachment-preview-section">
                            <div className="attachment-section-title">Attached Reference Material</div>
                            <div className="attachment-file-card new-file">
                                <PictureAsPdfRoundedIcon style={{ color: currClass?.classTheme || '#00a896', fontSize: 28 }} />
                                <span className="attachment-link">{file.name}</span>
                                <IconButton
                                    size="small"
                                    onClick={() => setFile(null)}
                                    title="Remove file"
                                    className="remove-file-btn"
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
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
                        style={{ backgroundColor: currClass?.classTheme || '#00a896' }}
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

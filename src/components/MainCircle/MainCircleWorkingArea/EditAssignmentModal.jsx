import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { editAssignment } from "../../../Api/apiCaller/assignmentapicaller";
import TopicDropdown from "../../Helper/TopicDropdown";
import toast from "react-hot-toast";
import "./editAssignmentModal.css";

export default function EditAssignmentModal({ open, onClose, assignment, onAssignmentUpdated }) {
    const dispatch = useDispatch();
    const currClass = useSelector((state) => state.classes.currClass);

    const [name, setName] = useState(assignment?.name || "");
    const [description, setDescription] = useState(assignment?.description || "");
    const [category, setCategory] = useState(assignment?.category?._id || assignment?.category || "");
    const [dueDate, setDueDate] = useState("");
    const [acceptAfterDue, setAcceptAfterDue] = useState(assignment?.acceptAfterDue ?? true);
    const [status, setStatus] = useState(assignment?.status || "Published");
    
    const [existingFile, setExistingFile] = useState(assignment?.file || "");
    const [newFile, setNewFile] = useState(null);
    const [removeExistingFile, setRemoveExistingFile] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    // Format ISO string to datetime-local value (YYYY-MM-DDTHH:mm)
    const formatForDatetimeInput = (dateStr) => {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "";
            const offset = d.getTimezoneOffset() * 60000;
            const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
            return localISOTime;
        } catch (e) {
            return "";
        }
    };

    useEffect(() => {
        if (open && assignment) {
            setName(assignment.name || "");
            setDescription(assignment.description || "");
            setCategory(assignment.category?._id || assignment.category || "");
            setDueDate(formatForDatetimeInput(assignment.dueDate));
            setAcceptAfterDue(assignment.acceptAfterDue ?? true);
            setStatus(assignment.status || "Published");
            setExistingFile(assignment.file || "");
            setNewFile(null);
            setRemoveExistingFile(false);
            if (editorRef.current) {
                editorRef.current.innerHTML = assignment.description || "";
            }
        }
    }, [open, assignment]);

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
        const file = e.target.files?.[0];
        if (file) {
            setNewFile(file);
            setRemoveExistingFile(true);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveCurrentExistingFile = () => {
        setExistingFile("");
        setRemoveExistingFile(true);
    };

    const handleRemoveNewFile = () => {
        setNewFile(null);
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
            formData.append("category", category || "");
            if (dueDate) {
                formData.append("dueDate", new Date(dueDate).toISOString());
            }
            formData.append("acceptAfterDue", acceptAfterDue);
            formData.append("status", status);

            if (newFile) {
                formData.append("file", newFile);
            } else if (removeExistingFile) {
                formData.append("removeFile", "true");
            }

            const resultAction = await dispatch(editAssignment({ assId: assignment._id, data: formData }));

            if (editAssignment.fulfilled.match(resultAction)) {
                const updatedData = resultAction.payload?.data || resultAction.payload;

                if (currClass && currClass.addedAssignment) {
                    const updatedAssignments = currClass.addedAssignment.map((a) =>
                        (a._id === assignment._id || a === assignment._id) ? { ...a, ...updatedData } : a
                    );
                    dispatch(updateCurrClass({ addedAssignment: updatedAssignments }));
                }

                if (onAssignmentUpdated) {
                    onAssignmentUpdated(updatedData);
                }

                onClose();
            }
        } catch (err) {
            console.error("Error saving edited assignment:", err);
            toast.error(err?.message || "Failed to update assignment");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={!isSaving ? onClose : undefined}
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
                        <h3>Edit Assignment</h3>
                    </div>
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
                            disabled={isSaving}
                        />
                    </div>

                    {/* Rich Content Editor */}
                    <div className="editor-wrapper">
                        <div
                            ref={editorRef}
                            contentEditable={!isSaving}
                            className="edit-assignment-content-editor"
                            placeholder="Instructions (optional or detailed steps)..."
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

                    {/* Controls Grid (Due Date, Topic, Late Submissions, Status) */}
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
                            <label className="meta-label">Topic</label>
                            <TopicDropdown
                                selectedTopic={category}
                                onSelectTopic={(topicId) => setCategory(topicId)}
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
                                <InputLabel id="edit-ass-status-label">Status</InputLabel>
                                <Select
                                    labelId="edit-ass-status-label"
                                    id="edit-ass-status-select"
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

                    {/* Existing Attached File */}
                    {existingFile && !removeExistingFile && (
                        <div className="attachment-preview-section">
                            <div className="attachment-section-title">Current Attachment</div>
                            <div className="attachment-file-card">
                                <PictureAsPdfRoundedIcon style={{ color: '#ef4444', fontSize: 28 }} />
                                <a
                                    href={existingFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="attachment-link"
                                >
                                    View Attached File
                                </a>
                                <IconButton
                                    size="small"
                                    onClick={handleRemoveCurrentExistingFile}
                                    title="Remove attachment"
                                    className="remove-file-btn"
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </div>
                        </div>
                    )}

                    {/* New Upload File Preview */}
                    {newFile && (
                        <div className="attachment-preview-section">
                            <div className="attachment-section-title">New Replacement Attachment</div>
                            <div className="attachment-file-card new-file">
                                <PictureAsPdfRoundedIcon style={{ color: currClass?.classTheme || '#00a896', fontSize: 28 }} />
                                <span className="attachment-link">{newFile.name}</span>
                                <IconButton
                                    size="small"
                                    onClick={handleRemoveNewFile}
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
                        onClick={onClose}
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

import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    LayersOutlined as LayersOutlinedIcon,
    FolderOutlined as FolderOutlinedIcon,
    CheckRounded as CheckRoundedIcon,
    KeyboardArrowDownRounded as KeyboardArrowDownRoundedIcon,
    AddRounded as AddRoundedIcon,
    DeleteOutlineRounded as DeleteOutlineRoundedIcon,
    SearchRounded as SearchRoundedIcon
} from "@mui/icons-material";
import { IconButton, Tooltip, CircularProgress } from "@mui/material";
import { createCategory, deleteCategory } from "../../../Api/apiCaller/categoryapicaller";
import { updateCurrClass } from "../../../Slices/classSlice";
import ConfirmationDialog from "../../Helper/ConfirmationDialog";
import toast from "react-hot-toast";
import "./ClassworkTopicsDropdown.css";

export default function ClassworkTopicsDropdown({
    categories = [],
    selectedTopic = "ALL",
    onSelectTopic,
    isTeacher = false,
    currClassId,
    assignments = [],
    categorizedAssignments = {},
    themeColor = "#00a896"
}) {
    const dispatch = useDispatch();
    const currClass = useSelector((state) => state.classes.currClass);

    const [isOpen, setIsOpen] = useState(false);
    const [topicSearch, setTopicSearch] = useState("");
    const [newTopicName, setNewTopicName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, topic: null });

    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Active Category Details
    const activeCategory = categories.find((c) => (c._id || c) === selectedTopic);
    const activeLabel = activeCategory ? activeCategory.name : "All topics";

    // Filter topics based on search
    const filteredCategories = categories.filter((cat) =>
        cat.name?.toLowerCase().includes(topicSearch.toLowerCase())
    );

    // Selection handler
    const handleSelect = (topicId) => {
        if (onSelectTopic) {
            onSelectTopic(topicId || "ALL");
        }
        setIsOpen(false);
    };

    // Inline topic creation for teachers/admins
    const handleCreateTopic = async (e) => {
        if (e) e.preventDefault();
        const trimmed = newTopicName.trim();
        if (!trimmed) return;

        setIsCreating(true);
        try {
            const res = await dispatch(createCategory({ name: trimmed, classId: currClassId })).unwrap();
            if (res && res.data) {
                dispatch(updateCurrClass({
                    addedCategory: [...(currClass?.addedCategory || []), res.data]
                }));
                setNewTopicName("");
                toast.success(`Topic "${trimmed}" created`);
            }
        } catch (err) {
            console.error("Error creating topic:", err);
        } finally {
            setIsCreating(false);
        }
    };

    // Topic Deletion
    const handleDeleteClick = (e, topic) => {
        e.stopPropagation();
        setDeleteConfirm({ open: true, topic });
    };

    const confirmDeleteTopic = async () => {
        const topic = deleteConfirm.topic;
        if (!topic) return;

        try {
            const res = await dispatch(deleteCategory({ categoryId: topic._id, classId: currClassId })).unwrap();
            if (res) {
                const updatedCategories = categories.filter((c) => c._id !== topic._id);
                dispatch(updateCurrClass({
                    addedCategory: updatedCategories
                }));
                if (selectedTopic === topic._id && onSelectTopic) {
                    onSelectTopic("ALL");
                }
                toast.success("Topic deleted");
            }
        } catch (err) {
            console.error("Error deleting topic:", err);
        } finally {
            setDeleteConfirm({ open: false, topic: null });
        }
    };

    return (
        <div className="classwork-topics-wrapper" ref={dropdownRef}>
            {/* Main Trigger Button */}
            <button
                type="button"
                className={`classwork-topics-btn ${isOpen ? "active" : ""}`}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
            >
                <div className="classwork-topics-btn-left">
                    {selectedTopic === "ALL" ? (
                        <LayersOutlinedIcon className="classwork-topics-btn-icon" />
                    ) : (
                        <FolderOutlinedIcon className="classwork-topics-btn-icon" />
                    )}
                    <span className="classwork-topics-btn-text" title={activeLabel}>
                        {activeLabel}
                    </span>
                    {selectedTopic === "ALL" && assignments.length > 0 && (
                        <span className="classwork-topics-count-badge">
                            {assignments.length}
                        </span>
                    )}
                    {selectedTopic !== "ALL" && categorizedAssignments[selectedTopic] && (
                        <span className="classwork-topics-count-badge">
                            {categorizedAssignments[selectedTopic].length}
                        </span>
                    )}
                </div>
                <KeyboardArrowDownRoundedIcon
                    className={`classwork-chevron-icon ${isOpen ? "rotate" : ""}`}
                />
            </button>

            {/* Floating Dropdown Menu */}
            {isOpen && (
                <div className="classwork-topics-menu">
                    {/* Header with Search if categories > 3 */}
                    {categories.length > 3 && (
                        <div className="classwork-menu-search">
                            <SearchRoundedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search topics..."
                                value={topicSearch}
                                onChange={(e) => setTopicSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Options List */}
                    <div className="classwork-menu-list">
                        {/* All Topics Item */}
                        <div
                            className={`classwork-menu-item ${selectedTopic === "ALL" ? "selected" : ""}`}
                            onClick={() => handleSelect("ALL")}
                            style={selectedTopic === "ALL" ? { backgroundColor: `${themeColor}12` } : {}}
                        >
                            <div className="classwork-item-content">
                                <LayersOutlinedIcon
                                    className="classwork-item-icon"
                                    style={{ color: selectedTopic === "ALL" ? themeColor : "#64748b" }}
                                />
                                <span
                                    className="classwork-item-name"
                                    style={{ color: selectedTopic === "ALL" ? themeColor : "#1e293b", fontWeight: selectedTopic === "ALL" ? 600 : 500 }}
                                >
                                    All topics
                                </span>
                                <span className="classwork-item-counter">
                                    {assignments.length}
                                </span>
                            </div>
                            {selectedTopic === "ALL" && (
                                <CheckRoundedIcon className="classwork-item-check" style={{ color: themeColor }} />
                            )}
                        </div>

                        {/* Individual Category Items */}
                        {filteredCategories.map((cat) => {
                            const isSelected = selectedTopic === cat._id;
                            const count = categorizedAssignments[cat._id]?.length || 0;

                            return (
                                <div
                                    key={cat._id}
                                    className={`classwork-menu-item ${isSelected ? "selected" : ""}`}
                                    onClick={() => handleSelect(cat._id)}
                                    style={isSelected ? { backgroundColor: `${themeColor}12` } : {}}
                                >
                                    <div className="classwork-item-content">
                                        <FolderOutlinedIcon
                                            className="classwork-item-icon"
                                            style={{ color: isSelected ? themeColor : "#64748b" }}
                                        />
                                        <span
                                            className="classwork-item-name"
                                            title={cat.name}
                                            style={{ color: isSelected ? themeColor : "#1e293b", fontWeight: isSelected ? 600 : 500 }}
                                        >
                                            {cat.name}
                                        </span>
                                        <span className="classwork-item-counter">
                                            {count}
                                        </span>
                                    </div>

                                    <div className="classwork-item-actions">
                                        {isSelected && (
                                            <CheckRoundedIcon className="classwork-item-check" style={{ color: themeColor }} />
                                        )}
                                        {isTeacher && (
                                            <Tooltip title="Delete topic" arrow placement="top">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleDeleteClick(e, cat)}
                                                    className="classwork-item-delete-btn"
                                                >
                                                    <DeleteOutlineRoundedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {categories.length === 0 && (
                            <div className="classwork-empty-menu-notice">
                                No topics created yet
                            </div>
                        )}

                        {categories.length > 0 && filteredCategories.length === 0 && (
                            <div className="classwork-empty-menu-notice">
                                No matching topics
                            </div>
                        )}
                    </div>

                    {/* Inline Quick Add Topic for Teacher */}
                    {isTeacher && (
                        <div className="classwork-menu-add-topic">
                            <form onSubmit={handleCreateTopic} className="classwork-add-topic-form">
                                <input
                                    type="text"
                                    placeholder="Add new topic..."
                                    value={newTopicName}
                                    onChange={(e) => setNewTopicName(e.target.value)}
                                    disabled={isCreating}
                                />
                                <button
                                    type="submit"
                                    disabled={isCreating || !newTopicName.trim()}
                                    style={{ backgroundColor: themeColor }}
                                    title="Create topic"
                                >
                                    {isCreating ? (
                                        <CircularProgress size={13} color="inherit" />
                                    ) : (
                                        <AddRoundedIcon fontSize="small" />
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Confirmation Dialog for Topic Deletion */}
            <ConfirmationDialog
                open={deleteConfirm.open}
                title="Delete Topic"
                content="Are you sure you want to delete this topic? Any assignments inside it will be moved to General Classwork."
                confirmText="Delete"
                confirmColor="error"
                onConfirm={confirmDeleteTopic}
                onCancel={() => setDeleteConfirm({ open: false, topic: null })}
            />
        </div>
    );
}

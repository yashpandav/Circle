import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createCategory, deleteCategory } from "../../Api/apiCaller/categoryapicaller";
import { getClass } from "../../Api/apiCaller/classapicaller";
import { updateCurrClass } from "../../Slices/classSlice";
import { IconButton, Tooltip } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import ConfirmationDialog from "./ConfirmationDialog";
import "./TopicDropdown.css";

export default function TopicDropdown({
    selectedTopic = "",
    onSelectTopic,
    defaultLabel = "All topics",
    emptyValue = "",
    showHeader = false,
    title = "Topics",
    allowCreate = true,
    allowDelete = true,
    className = "",
    style = {},
    triggerStyle = {},
    disabled = false,
    showBadge = true,
}) {
    const dispatch = useDispatch();
    const currClass = useSelector((state) => state.classes.currClass);
    const user = useSelector((state) => state.auth.user);

    const [isOpen, setIsOpen] = useState(false);
    const [newTopic, setNewTopic] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmConfig, setConfirmConfig] = useState({ open: false, topicId: null });

    const dropdownRef = useRef(null);

    const themeColor = currClass?.themeColor || "#1967d2";

    // Close dropdown on click outside
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

    const isTeacherOrAdmin = Boolean(
        currClass?.admin?._id === user?._id ||
        currClass?.admin === user?._id ||
        currClass?.teacher?.some((t) => (t?._id === user?._id || t === user?._id))
    );

    const categories = currClass?.addedCategory || [];

    // Identify active category
    const isDefaultSelected = !selectedTopic || selectedTopic === "ALL" || selectedTopic === emptyValue;
    const activeCategory = !isDefaultSelected
        ? categories.find((c) => (c._id || c) === selectedTopic)
        : null;
    const activeLabel = activeCategory ? activeCategory.name : defaultLabel;

    const filteredCategories = categories.filter((cat) =>
        cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (cat) => {
        if (!cat) {
            if (onSelectTopic) onSelectTopic(emptyValue, null);
        } else {
            if (onSelectTopic) onSelectTopic(cat._id, cat);
        }
        setIsOpen(false);
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        const trimmed = newTopic.trim();
        if (!trimmed || !currClass?._id) return;

        setIsCreating(true);
        try {
            const response = await dispatch(createCategory({ name: trimmed, classId: currClass._id })).unwrap();
            const createdCat = response?.data || response;
            if (createdCat && createdCat._id) {
                // Synchronously update Redux class state
                dispatch(
                    updateCurrClass({
                        addedCategory: [...(currClass.addedCategory || []), createdCat],
                    })
                );
                // Automatically select newly created category
                if (onSelectTopic) {
                    onSelectTopic(createdCat._id, createdCat);
                }
            }
            setNewTopic("");
            dispatch(getClass({ id: currClass._id, dispatch }));
        } catch (err) {
            console.error("Error creating topic:", err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        setConfirmConfig({ open: true, topicId: id });
    };

    const confirmDelete = async () => {
        if (confirmConfig.topicId && currClass?._id) {
            const deletedId = confirmConfig.topicId;
            try {
                await dispatch(deleteCategory({ id: deletedId, classId: currClass._id })).unwrap();
                // Synchronously update Redux class state
                dispatch(
                    updateCurrClass({
                        addedCategory: (currClass.addedCategory || []).filter(
                            (c) => (c._id || c) !== deletedId
                        ),
                    })
                );
                // If deleted category was selected, revert to default
                if (selectedTopic === deletedId) {
                    if (onSelectTopic) onSelectTopic(emptyValue, null);
                }
                dispatch(getClass({ id: currClass._id, dispatch }));
            } catch (err) {
                console.error("Error deleting topic:", err);
            } finally {
                setConfirmConfig({ open: false, topicId: null });
            }
        }
    };

    return (
        <div
            className={`global-topic-dropdown-wrapper ${showHeader ? "with-card-header" : ""} ${className}`}
            ref={dropdownRef}
            style={{ "--class-theme": themeColor, ...style }}
        >
            {/* Optional Header Row (Used in Stream left sidebar card) */}
            {showHeader && (
                <div className="global-topic-header-row">
                    <div className="global-topic-header-left">
                        <FilterListRoundedIcon className="global-topic-header-icon" />
                        <span className="global-topic-title">{title}</span>
                    </div>
                    {showBadge && categories.length > 0 && (
                        <span className="global-topics-count-badge">{categories.length}</span>
                    )}
                </div>
            )}

            {/* Dropdown Trigger Button */}
            <button
                type="button"
                className={`global-topic-trigger-btn ${isOpen ? "open" : ""} ${isDefaultSelected ? "is-default" : "is-active-topic"}`}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                disabled={disabled}
                style={triggerStyle}
            >
                <div className="global-topic-selected-info">
                    {!isDefaultSelected ? (
                        <LabelOutlinedIcon className="global-topic-selected-icon" />
                    ) : (
                        <LayersOutlinedIcon className="global-topic-selected-icon" />
                    )}
                    <span className="global-topic-selected-label" title={activeLabel}>
                        {activeLabel}
                    </span>
                </div>
                <KeyboardArrowDownRoundedIcon
                    className={`global-topic-chevron-icon ${isOpen ? "rotate" : ""}`}
                />
            </button>

            {/* Floating Dropdown Menu */}
            {isOpen && (
                <div className="global-topic-menu">
                    {categories.length > 4 && (
                        <div className="global-topic-search-box">
                            <input
                                type="text"
                                className="global-topic-search-input"
                                placeholder="Search topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="global-topic-options-list">
                        {/* Default (All topics / No topic) Option */}
                        <div
                            className={`global-topic-option-item ${isDefaultSelected ? "active" : ""}`}
                            onClick={() => handleSelect(null)}
                        >
                            <div className="global-topic-option-left">
                                <LayersOutlinedIcon className="global-topic-option-icon" />
                                <span className="global-topic-option-name">{defaultLabel}</span>
                            </div>
                            {isDefaultSelected && (
                                <CheckRoundedIcon className="global-topic-check-icon" />
                            )}
                        </div>

                        {/* Category Items */}
                        {filteredCategories.map((cat) => {
                            const isSelected = selectedTopic === cat._id;
                            return (
                                <div
                                    key={cat._id}
                                    className={`global-topic-option-item ${isSelected ? "active" : ""}`}
                                    onClick={() => handleSelect(cat)}
                                >
                                    <div className="global-topic-option-left">
                                        <LabelOutlinedIcon className="global-topic-option-icon" />
                                        <span className="global-topic-option-name" title={cat.name}>
                                            {cat.name}
                                        </span>
                                    </div>
                                    <div className="global-topic-option-actions">
                                        {isSelected && (
                                            <CheckRoundedIcon className="global-topic-check-icon" />
                                        )}
                                        {allowDelete && isTeacherOrAdmin && (
                                            <Tooltip title="Delete topic" arrow placement="top">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleDeleteClick(e, cat._id)}
                                                    className="global-topic-delete-btn"
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
                            <div className="global-topic-empty-msg">No topics added yet.</div>
                        )}

                        {categories.length > 0 && filteredCategories.length === 0 && (
                            <div className="global-topic-empty-msg">No matching topics.</div>
                        )}
                    </div>

                    {/* Teacher/Admin Add Topic Section */}
                    {allowCreate && isTeacherOrAdmin && (
                        <div className="global-topic-add-section">
                            <form className="global-topic-add-form" onSubmit={handleCreateTopic}>
                                <input
                                    type="text"
                                    placeholder="Add new topic..."
                                    value={newTopic}
                                    onChange={(e) => setNewTopic(e.target.value)}
                                    disabled={isCreating}
                                    className="global-topic-add-input"
                                />
                                <button
                                    type="submit"
                                    disabled={isCreating || !newTopic.trim()}
                                    className="global-topic-add-btn"
                                    title="Add topic"
                                >
                                    <AddRoundedIcon fontSize="small" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Confirmation Dialog for Deleting Topic */}
            <ConfirmationDialog
                open={confirmConfig.open}
                title="Delete Topic"
                content="Are you sure you want to delete this topic? Posts and assignments inside will not be deleted, but they will lose this category."
                confirmText="Delete"
                confirmColor="error"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmConfig({ open: false, topicId: null })}
            />
        </div>
    );
}

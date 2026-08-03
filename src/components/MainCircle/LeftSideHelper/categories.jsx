import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createCategory, deleteCategory } from "../../../Api/apiCaller/categoryapicaller";
import { getClass } from "../../../Api/apiCaller/classapicaller";
import { IconButton, Tooltip } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConfirmationDialog from "../../Helper/ConfirmationDialog";
import "./categories.css";

export default function CategoriesComponent() {
    const dispatch = useDispatch();
    const currClass = useSelector((state) => state.classes.currClass);
    const user = useSelector((state) => state.auth.user);
    const [isOpen, setIsOpen] = useState(false);
    const [newTopic, setNewTopic] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [confirmConfig, setConfirmConfig] = useState({ open: false, topicId: null });
    
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTopicId = searchParams.get("topic");

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

    if (!currClass) return null;

    const isAdminOrTeacher = 
        currClass?.admin?._id === user?._id || 
        currClass?.admin === user?._id ||
        currClass?.teacher?.some(t => (t?._id === user?._id || t === user?._id));

    const categories = currClass.addedCategory || [];

    const activeCategory = categories.find(c => (c._id || c) === activeTopicId);
    const activeLabel = activeCategory ? activeCategory.name : "All topics";

    const filteredCategories = categories.filter(cat => 
        cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectTopic = (topicId) => {
        if (!topicId) {
            navigate(`/workarea/circle/${currClass._id}`);
        } else {
            navigate(`/workarea/circle/${currClass._id}?topic=${topicId}`);
        }
        setIsOpen(false);
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        if (!newTopic.trim()) return;
        
        setIsCreating(true);
        try {
            await dispatch(createCategory({ name: newTopic.trim(), classId: currClass._id })).unwrap();
            setNewTopic("");
            dispatch(getClass({ id: currClass._id, dispatch }));
        } catch (err) {
            // Handled in apiCaller toast
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteClick = (e, id) => {
        e.stopPropagation();
        setConfirmConfig({ open: true, topicId: id });
    };

    const confirmDelete = async () => {
        if (confirmConfig.topicId) {
            await dispatch(deleteCategory({ id: confirmConfig.topicId, classId: currClass._id })).unwrap();
            if (activeTopicId === confirmConfig.topicId) {
                navigate(`/workarea/circle/${currClass._id}`);
            }
            dispatch(getClass({ id: currClass._id, dispatch }));
            setConfirmConfig({ open: false, topicId: null });
        }
    };

    return (
        <div className="categories-container" ref={dropdownRef}>
            <div className="categories-header-row">
                <div className="categories-header-left">
                    <FilterListRoundedIcon className="categories-header-icon" />
                    <span className="categories-title">Topics</span>
                </div>
                {categories.length > 0 && (
                    <span className="topics-count-badge">{categories.length}</span>
                )}
            </div>

            {/* Dropdown Trigger Selector */}
            <button 
                type="button" 
                className={`topics-dropdown-trigger ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(prev => !prev)}
                aria-expanded={isOpen}
            >
                <div className="topics-selected-info">
                    {activeTopicId ? (
                        <LabelOutlinedIcon className="selected-topic-icon" />
                    ) : (
                        <LayersOutlinedIcon className="selected-topic-icon" />
                    )}
                    <span className="topics-selected-label" title={activeLabel}>
                        {activeLabel}
                    </span>
                </div>
                <KeyboardArrowDownRoundedIcon className={`dropdown-chevron-icon ${isOpen ? "rotate" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="topics-dropdown-menu">
                    {categories.length > 4 && (
                        <div className="topics-search-wrapper">
                            <input
                                type="text"
                                className="topics-search-input"
                                placeholder="Search topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="topics-options-list">
                        {/* All Topics Option */}
                        <div 
                            className={`topic-option-item ${!activeTopicId ? "active" : ""}`}
                            onClick={() => handleSelectTopic(null)}
                        >
                            <div className="topic-option-left">
                                <LayersOutlinedIcon className="topic-option-icon" />
                                <span className="topic-option-name">All topics</span>
                            </div>
                            {!activeTopicId && <CheckRoundedIcon className="active-check-icon" />}
                        </div>

                        {/* Category Items */}
                        {filteredCategories.map((cat) => {
                            const isSelected = activeTopicId === cat._id;
                            return (
                                <div 
                                    key={cat._id}
                                    className={`topic-option-item ${isSelected ? "active" : ""}`}
                                    onClick={() => handleSelectTopic(cat._id)}
                                >
                                    <div className="topic-option-left">
                                        <LabelOutlinedIcon className="topic-option-icon" />
                                        <span className="topic-option-name" title={cat.name}>{cat.name}</span>
                                    </div>
                                    <div className="topic-option-actions">
                                        {isSelected && <CheckRoundedIcon className="active-check-icon" />}
                                        {isAdminOrTeacher && (
                                            <Tooltip title="Delete topic" arrow placement="top">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={(e) => handleDeleteClick(e, cat._id)} 
                                                    className="delete-topic-icon-btn"
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
                            <div className="empty-topics-message">No topics added yet.</div>
                        )}

                        {categories.length > 0 && filteredCategories.length === 0 && (
                            <div className="empty-topics-message">No matching topics.</div>
                        )}
                    </div>

                    {/* Teacher/Admin Add Topic Section */}
                    {isAdminOrTeacher && (
                        <div className="add-topic-section">
                            <form className="add-topic-form" onSubmit={handleCreateTopic}>
                                <input 
                                    type="text" 
                                    placeholder="Add new topic..." 
                                    value={newTopic}
                                    onChange={(e) => setNewTopic(e.target.value)}
                                    disabled={isCreating}
                                    className="add-topic-input"
                                />
                                <button 
                                    type="submit" 
                                    disabled={isCreating || !newTopic.trim()} 
                                    className="add-topic-btn"
                                    title="Add topic"
                                >
                                    <AddRoundedIcon fontSize="small" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

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


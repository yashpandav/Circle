import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createCategory, deleteCategory } from "../../../Api/apiCaller/categoryapicaller";
import { getClass } from "../../../Api/apiCaller/classapicaller";

import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./categories.css";

export default function CategoriesComponent() {
    const dispatch = useDispatch();
    const currClass = useSelector((state) => state.classes.currClass);
    const user = useSelector((state) => state.auth.user);
    const [newTopic, setNewTopic] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTopicId = searchParams.get("topic");

    if (!currClass) return null;

    const isAdminOrTeacher = currClass?.admin?._id === user?._id || currClass?.teacher?.some(t => t?._id === user?._id);
    const categories = currClass.addedCategory || [];

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        if (!newTopic.trim()) return;
        
        setIsCreating(true);
        await dispatch(createCategory({ name: newTopic, classId: currClass._id })).unwrap();
        setNewTopic("");
        setIsCreating(false);
        // Refresh class details to show new topic
        dispatch(getClass({ id: currClass._id, dispatch }));
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this topic?")) {
            await dispatch(deleteCategory({ id, classId: currClass._id })).unwrap();
            // Refresh class details to remove topic
            dispatch(getClass({ id: currClass._id, dispatch }));
        }
    };

    return (
        <div className="categories-container">
            <h3 className="categories-title">Topics</h3>
            
            {isAdminOrTeacher && (
                <form className="create-topic-form" onSubmit={handleCreateTopic}>
                    <input 
                        type="text" 
                        placeholder="Add a topic..." 
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        disabled={isCreating}
                        className="topic-input"
                    />
                    <button 
                        type="submit" 
                        disabled={isCreating || !newTopic.trim()} 
                        className="topic-submit-btn"
                    >
                        Add
                    </button>
                </form>
            )}

            {categories.length === 0 ? (
                <p className="no-topics-text">No topics yet.</p>
            ) : (
                <ul className="categories-list">
                    <li 
                        className={`category-item ${!activeTopicId ? 'active-topic' : ''}`}
                        onClick={() => navigate(`/workarea/circle/${currClass._id}`)}
                    >
                        <span className="category-name">All topics</span>
                    </li>
                    {categories.map((cat) => (
                        <li 
                            key={cat._id} 
                            className={`category-item ${activeTopicId === cat._id ? 'active-topic' : ''}`}
                            onClick={() => navigate(`/workarea/circle/${currClass._id}?topic=${cat._id}`)}
                        >
                            <span className="category-name">{cat.name}</span>
                            {isAdminOrTeacher && (
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(cat._id); }} className="delete-topic-btn">
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

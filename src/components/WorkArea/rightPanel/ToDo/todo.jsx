import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTodoAssignments } from "../../../../Api/apiCaller/todoapicaller";
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import socket from "../../../../socket/socket";
import {
    Assignment as AssignmentIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    WarningAmber as WarningAmberIcon,
    FilterList as FilterListIcon,
    AccessTime as AccessTimeIcon,
    FolderOutlined as FolderOutlinedIcon,
    ChevronRight as ChevronRightIcon
} from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import "./todo.css";

export default function ToDo() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [todoData, setTodoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Assigned"); // "Assigned" | "Missing" | "Done"
    const [selectedClassId, setSelectedClassId] = useState("all");

    const joinedClasses = useSelector(state => state.classes.joinedClassesAsStudent) || [];

    const fetchTodos = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await dispatch(getTodoAssignments(selectedClassId)).unwrap();
            if (res && res.data && res.data.byClass) {
                setTodoData(res.data.byClass);
            } else if (res && res.byClass) {
                setTodoData(res.byClass);
            } else {
                setTodoData([]);
            }
        } catch (err) {
            console.error("Failed to fetch todos", err);
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [dispatch, selectedClassId]);

    // Initial fetch on mount or class filter change
    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    // Real-Time Socket Listeners for dynamic synchronization
    useEffect(() => {
        const handleTodoUpdate = () => {
            fetchTodos(true);
        };

        socket.on("todo:updated", handleTodoUpdate);
        socket.on("assignment:new", handleTodoUpdate);
        socket.on("assignment:updated", handleTodoUpdate);
        socket.on("assignment:deleted", handleTodoUpdate);
        socket.on("assignment:submitted", handleTodoUpdate);
        socket.on("assignment:submission_updated", handleTodoUpdate);
        socket.on("assignment:submission_deleted", handleTodoUpdate);

        return () => {
            socket.off("todo:updated", handleTodoUpdate);
            socket.off("assignment:new", handleTodoUpdate);
            socket.off("assignment:updated", handleTodoUpdate);
            socket.off("assignment:deleted", handleTodoUpdate);
            socket.off("assignment:submitted", handleTodoUpdate);
            socket.off("assignment:submission_updated", handleTodoUpdate);
            socket.off("assignment:submission_deleted", handleTodoUpdate);
        };
    }, [fetchTodos]);

    // Calculate dynamic counts for tab badges
    const { assignedCount, missingCount, doneCount } = useMemo(() => {
        let assigned = 0;
        let missing = 0;
        let done = 0;

        todoData.forEach(c => {
            if (c.assigned) assigned += c.assigned.length;
            if (c.missing) missing += c.missing.length;
            if (c.completed) done += c.completed.length;
        });

        return { assignedCount: assigned, missingCount: missing, doneCount: done };
    }, [todoData]);

    const formatDueDate = (dateStr) => {
        if (!dateStr) return "No due date";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "No due date";

        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);

        const isToday = date.toDateString() === now.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) return `Due today at ${timeStr}`;
        if (isTomorrow) return `Due tomorrow at ${timeStr}`;

        return `Due ${date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
        })} at ${timeStr}`;
    };

    const renderAssignmentList = () => {
        if (!todoData || todoData.length === 0) {
            return (
                <div className="empty-todo-state">
                    <CheckCircleOutlineIcon className="empty-state-icon done" />
                    <h2>No circles found with assigned work.</h2>
                    <p>When teachers post assignments in your enrolled circles, they will appear here.</p>
                </div>
            );
        }

        const sections = [];

        todoData.forEach(classData => {
            let list = [];
            if (activeTab === "Assigned") list = classData.assigned || [];
            else if (activeTab === "Missing") list = classData.missing || [];
            else if (activeTab === "Done") list = classData.completed || [];

            if (list.length > 0) {
                const classThemeColor = classData.classId?.classTheme || "#1967d2";
                const classTitle = classData.classId?.name || "Class";
                const sectionName = classData.classId?.className || classData.classId?.subject || "";

                sections.push(
                    <div key={classData.classId?._id || Math.random()} className="todo-class-section">
                        <div className="todo-class-header" style={{ borderLeft: `5px solid ${classThemeColor}` }}>
                            <div className="todo-class-info">
                                <h3 className="todo-class-title">{classTitle}</h3>
                                {sectionName && <span className="todo-class-subtitle">{sectionName}</span>}
                            </div>
                            <span className="todo-count-badge">
                                {list.length} {list.length === 1 ? 'assignment' : 'assignments'}
                            </span>
                        </div>
                        <Divider />
                        <div className="todo-items-list">
                            {list.map(ass => (
                                <div
                                    key={ass._id}
                                    className="todo-assignment-item"
                                    onClick={() => navigate(`/workarea/circle/${classData.classId?._id}/assignment/${ass._id}`)}
                                >
                                    <div className="todo-item-left">
                                        <div
                                            className={`todo-icon-wrapper ${activeTab === 'Missing' ? 'missing-icon' : activeTab === 'Done' ? 'done-icon' : ''}`}
                                            style={activeTab === 'Assigned' ? { backgroundColor: classThemeColor } : {}}
                                        >
                                            {activeTab === 'Done' ? (
                                                <CheckCircleOutlineIcon />
                                            ) : activeTab === 'Missing' ? (
                                                <WarningAmberIcon />
                                            ) : (
                                                <AssignmentIcon />
                                            )}
                                        </div>
                                        <div className="todo-item-details">
                                            <h4 className="todo-assignment-name">{ass.name}</h4>
                                            <div className="todo-meta-row">
                                                {ass.category?.name && (
                                                    <span className="todo-category-tag">
                                                        <FolderOutlinedIcon className="tag-icon" />
                                                        {ass.category.name}
                                                    </span>
                                                )}
                                                {ass.teacher && (
                                                    <span className="todo-teacher-tag">
                                                        {ass.teacher.firstName} {ass.teacher.lastName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="todo-item-right">
                                        <div className="due-date-wrapper">
                                            <AccessTimeIcon className="time-icon" />
                                            <span className={`todo-due-date ${activeTab === 'Missing' ? 'missing-text' : activeTab === 'Done' ? 'done-text' : ''}`}>
                                                {activeTab === 'Done' ? 'Completed' : formatDueDate(ass.dueDate)}
                                            </span>
                                        </div>
                                        <ChevronRightIcon className="todo-arrow-icon" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }
        });

        if (sections.length === 0) {
            return (
                <div className="empty-todo-state">
                    {activeTab === "Missing" ? (
                        <>
                            <CheckCircleOutlineIcon className="empty-state-icon done" />
                            <h2>No missing assignments!</h2>
                            <p>Great job staying on top of your deadlines.</p>
                        </>
                    ) : activeTab === "Done" ? (
                        <>
                            <AssignmentIcon className="empty-state-icon assigned" />
                            <h2>No completed assignments yet.</h2>
                            <p>Turn in your work to see your completed submissions here.</p>
                        </>
                    ) : (
                        <>
                            <CheckCircleOutlineIcon className="empty-state-icon done" />
                            <h2>Hooray! No pending work.</h2>
                            <p>You have submitted all your active assignments.</p>
                        </>
                    )}
                </div>
            );
        }

        return sections;
    };

    return (
        <div className="todo-dashboard-container">
            <div className="todo-header">
                <div className="todo-header-title-block">
                    <h1>To-do</h1>
                    <p className="todo-subtitle">Keep track of your assignments and submission deadlines across all Circles.</p>
                </div>

                <div className="todo-filter-container">
                    <FilterListIcon className="filter-icon" />
                    <select
                        className="todo-class-select"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        <option value="all">All Circles</option>
                        {joinedClasses.map((c) => (
                            <option key={c._id} value={c._id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="todo-tabs-wrapper">
                <div className="todo-tabs">
                    <button
                        type="button"
                        className={`todo-tab ${activeTab === "Assigned" ? "active" : ""}`}
                        onClick={() => setActiveTab("Assigned")}
                    >
                        Assigned
                        {assignedCount > 0 && <span className="tab-badge">{assignedCount}</span>}
                    </button>
                    <button
                        type="button"
                        className={`todo-tab ${activeTab === "Missing" ? "active" : ""}`}
                        onClick={() => setActiveTab("Missing")}
                    >
                        Missing
                        {missingCount > 0 && <span className="tab-badge missing">{missingCount}</span>}
                    </button>
                    <button
                        type="button"
                        className={`todo-tab ${activeTab === "Done" ? "active" : ""}`}
                        onClick={() => setActiveTab("Done")}
                    >
                        Done
                        {doneCount > 0 && <span className="tab-badge done">{doneCount}</span>}
                    </button>
                </div>
            </div>

            <div className="todo-content-area">
                {loading ? (
                    <div className="todo-loader-wrapper">
                        <LoaderComponent />
                    </div>
                ) : (
                    renderAssignmentList()
                )}
            </div>
        </div>
    );
}

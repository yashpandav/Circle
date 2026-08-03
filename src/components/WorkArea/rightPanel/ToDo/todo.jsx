import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTodoAssignments } from "../../../../Api/apiCaller/todoapicaller";
import { joinedClass } from "../../../../Api/apiCaller/userapicaller";
import {
    setSelectedClassId,
    setActiveTab,
    setGroupBy,
    setSearchQuery
} from "../../../../Slices/todoSlice";
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import socket from "../../../../socket/socket";
import {
    Assignment as AssignmentIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    WarningAmberRounded as WarningAmberIcon,
    FilterList as FilterListIcon,
    AccessTime as AccessTimeIcon,
    FolderOutlined as FolderOutlinedIcon,
    ChevronRight as ChevronRightIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    CalendarMonthOutlined as CalendarMonthIcon,
    ClassOutlined as ClassOutlinedIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    AssignmentTurnedInOutlined as AssignmentTurnedInIcon
} from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import "./todo.css";

// Helper for formatting due dates in a natural, humanized way
const formatDueDate = (dateStr) => {
    if (!dateStr) return { text: "No due date", isUrgent: false, isOverdue: false };
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { text: "No due date", isUrgent: false, isOverdue: false };

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (diffMs < 0) {
        if (isYesterday) return { text: `Due yesterday, ${timeStr}`, isUrgent: true, isOverdue: true };
        if (Math.abs(diffDays) === 0) return { text: `Overdue (was due ${timeStr})`, isUrgent: true, isOverdue: true };
        return { text: `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`, isUrgent: true, isOverdue: true };
    }

    if (isToday) return { text: `Due today, ${timeStr}`, isUrgent: true, isOverdue: false };
    if (isTomorrow) return { text: `Due tomorrow, ${timeStr}`, isUrgent: true, isOverdue: false };

    const dateFormatted = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });

    return {
        text: `Due ${dateFormatted}, ${timeStr}`,
        isUrgent: false,
        isOverdue: false
    };
};

// Date bucket categorization
const getDateBucket = (dateStr, tabType) => {
    if (!dateStr || isNaN(new Date(dateStr).getTime())) {
        return "No due date";
    }

    const date = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((date.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

    if (tabType === "Assigned") {
        if (diffDays < 0) return "Overdue";
        if (diffDays <= 7) return "This week";
        if (diffDays <= 14) return "Next week";
        return "Later";
    } else {
        // For Missing or Done
        if (diffDays >= -7 && diffDays <= 0) return "This week";
        if (diffDays >= -14 && diffDays < -7) return "Last week";
        return "Earlier";
    }
};

export default function ToDo() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux State
    const todoData = useSelector((state) => state.todo?.todoData) || [];
    const selectedClassId = useSelector((state) => state.todo?.selectedClassId) || 'all';
    const activeTab = useSelector((state) => state.todo?.activeTab) || 'Assigned';
    const groupBy = useSelector((state) => state.todo?.groupBy) || 'time';
    const searchQuery = useSelector((state) => state.todo?.searchQuery) || '';
    const loading = useSelector((state) => state.todo?.loading) || false;

    const currClass = useSelector((state) => state.classes?.currClass);
    const joinedClassesAsStudent = useSelector((state) => state.classes?.joinedClassesAsStudent);
    const joinedClassesAsTeacher = useSelector((state) => state.classes?.joinedClassesAsTeacher);
    const createdClasses = useSelector((state) => state.classes?.createdClasses);

    // Fetch user classes if not yet loaded
    useEffect(() => {
        if (joinedClassesAsStudent === null || joinedClassesAsTeacher === null || createdClasses === null) {
            dispatch(joinedClass());
        }
    }, [dispatch, joinedClassesAsStudent, joinedClassesAsTeacher, createdClasses]);

    // Aggregate all classes for dropdown selection
    const allClassesList = useMemo(() => {
        const student = Array.isArray(joinedClassesAsStudent) ? joinedClassesAsStudent : [];
        const teacher = Array.isArray(joinedClassesAsTeacher) ? joinedClassesAsTeacher : [];
        const created = Array.isArray(createdClasses) ? createdClasses : [];

        const map = new Map();
        [...student, ...teacher, ...created].forEach((c) => {
            if (c && c._id && !map.has(c._id)) {
                map.set(c._id, c);
            }
        });
        return Array.from(map.values());
    }, [joinedClassesAsStudent, joinedClassesAsTeacher, createdClasses]);

    // Active theme color calculation with comprehensive resolution
    const activeThemeColor = useMemo(() => {
        if (selectedClassId && selectedClassId !== 'all') {
            const found = allClassesList.find((c) => c._id === selectedClassId);
            if (found?.classTheme && found.classTheme !== '#FFFFFF') {
                return found.classTheme;
            }
            const fromTodo = todoData.find((td) => (td.classId?._id || td.classId) === selectedClassId);
            if (fromTodo?.classId?.classTheme && fromTodo.classId.classTheme !== '#FFFFFF') {
                return fromTodo.classId.classTheme;
            }
        }
        if (currClass?.classTheme && currClass.classTheme !== '#FFFFFF') {
            return currClass.classTheme;
        }
        for (const td of todoData) {
            if (td.classId?.classTheme && td.classId.classTheme !== '#FFFFFF') {
                return td.classId.classTheme;
            }
        }
        for (const c of allClassesList) {
            if (c.classTheme && c.classTheme !== '#FFFFFF') {
                return c.classTheme;
            }
        }
        return '#1967d2';
    }, [selectedClassId, allClassesList, currClass, todoData]);

    // Collapsed sections tracking
    const [collapsedSections, setCollapsedSections] = useState({});

    const toggleSection = (sectionKey) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    // Fetch todos
    const fetchTodos = useCallback((isSilent = false) => {
        dispatch(getTodoAssignments({ classId: selectedClassId, isSilent }));
    }, [dispatch, selectedClassId]);

    useEffect(() => {
        fetchTodos(false);
    }, [fetchTodos]);

    // Real-time synchronization
    useEffect(() => {
        const handleLiveUpdate = () => {
            fetchTodos(true);
        };

        const events = [
            "todo:updated",
            "assignment:new",
            "assignment:updated",
            "assignment:deleted",
            "assignment:submitted",
            "assignment:submission_updated",
            "assignment:submission_deleted"
        ];

        events.forEach((evt) => socket.on(evt, handleLiveUpdate));

        return () => {
            events.forEach((evt) => socket.off(evt, handleLiveUpdate));
        };
    }, [fetchTodos]);

    // Calculate dynamic badge counts
    const { assignedCount, missingCount, doneCount } = useMemo(() => {
        let assigned = 0;
        let missing = 0;
        let done = 0;

        todoData.forEach((c) => {
            if (c.assigned) assigned += c.assigned.length;
            if (c.missing) missing += c.missing.length;
            if (c.completed) done += c.completed.length;
        });

        return { assignedCount: assigned, missingCount: missing, doneCount: done };
    }, [todoData]);

    // Filter assignments according to search and active tab
    const filteredAssignments = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const items = [];

        todoData.forEach((classData) => {
            let list = [];
            if (activeTab === "Assigned") list = classData.assigned || [];
            else if (activeTab === "Missing") list = classData.missing || [];
            else if (activeTab === "Done") list = classData.completed || [];

            list.forEach((ass) => {
                if (!ass || typeof ass !== 'object') return;

                const nameMatch = ass.name?.toLowerCase().includes(query);
                const descMatch = ass.description?.toLowerCase().includes(query);
                const catMatch = ass.category?.name?.toLowerCase().includes(query);
                const classNameMatch = classData.classId?.name?.toLowerCase().includes(query);
                const teacherMatch =
                    ass.teacher &&
                    `${ass.teacher.firstName || ''} ${ass.teacher.lastName || ''}`.toLowerCase().includes(query);

                if (!query || nameMatch || descMatch || catMatch || classNameMatch || teacherMatch) {
                    items.push({
                        ...ass,
                        classInfo: classData.classId || {}
                    });
                }
            });
        });

        return items;
    }, [todoData, activeTab, searchQuery]);

    // Grouping logic
    const groupedSections = useMemo(() => {
        if (groupBy === 'circle') {
            const classMap = {};
            filteredAssignments.forEach((ass) => {
                const classId = ass.classInfo?._id || 'unknown';
                if (!classMap[classId]) {
                    classMap[classId] = {
                        title: ass.classInfo?.name || "Circle",
                        subtitle: ass.classInfo?.className || ass.classInfo?.subject || "",
                        color: ass.classInfo?.classTheme || activeThemeColor,
                        items: []
                    };
                }
                classMap[classId].items.push(ass);
            });
            return Object.entries(classMap).map(([key, val]) => ({ key, ...val }));
        } else {
            // Group by Time Bucket
            const bucketOrder = activeTab === "Assigned"
                ? ["This week", "Next week", "Later", "No due date"]
                : ["This week", "Last week", "Earlier", "No due date"];

            const bucketMap = {};
            bucketOrder.forEach((b) => {
                bucketMap[b] = [];
            });

            filteredAssignments.forEach((ass) => {
                const bucket = getDateBucket(ass.dueDate, activeTab);
                if (!bucketMap[bucket]) {
                    bucketMap[bucket] = [];
                }
                bucketMap[bucket].push(ass);
            });

            return bucketOrder
                .filter((bucket) => bucketMap[bucket] && bucketMap[bucket].length > 0)
                .map((bucket) => ({
                    key: bucket,
                    title: bucket,
                    subtitle: `${bucketMap[bucket].length} ${bucketMap[bucket].length === 1 ? 'assignment' : 'assignments'}`,
                    color: activeTab === 'Missing' ? '#d93025' : activeTab === 'Done' ? '#188038' : activeThemeColor,
                    items: bucketMap[bucket]
                }));
        }
    }, [filteredAssignments, groupBy, activeTab, activeThemeColor]);

    return (
        <div className="todo-page-container" style={{ '--class-theme': activeThemeColor }}>
            {/* Header Title and Actions */}
            <div className="todo-header-bar">
                <div className="todo-header-left">
                    <h1 className="todo-page-title">To-do</h1>
                </div>

                <div className="todo-header-right">
                    <Tooltip title="Refresh assignments">
                        <IconButton
                            onClick={() => fetchTodos(false)}
                            className="todo-refresh-button"
                            size="small"
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* Navigation Tabs (Underline Style matching Google Classroom & Review) */}
            <div className="todo-tabs-container">
                <div className="todo-tabs-list">
                    <button
                        type="button"
                        className={`todo-tab ${activeTab === 'Assigned' ? 'active' : ''}`}
                        onClick={() => dispatch(setActiveTab('Assigned'))}
                    >
                        <span>Assigned</span>
                        <span className="todo-tab-badge">{assignedCount}</span>
                    </button>

                    <button
                        type="button"
                        className={`todo-tab ${activeTab === 'Missing' ? 'active missing' : ''}`}
                        onClick={() => dispatch(setActiveTab('Missing'))}
                    >
                        <span>Missing</span>
                        <span className="todo-tab-badge missing">{missingCount}</span>
                    </button>

                    <button
                        type="button"
                        className={`todo-tab ${activeTab === 'Done' ? 'active done' : ''}`}
                        onClick={() => dispatch(setActiveTab('Done'))}
                    >
                        <span>Done</span>
                        <span className="todo-tab-badge done">{doneCount}</span>
                    </button>
                </div>
            </div>

            {/* Toolbar: Circle Filter, Search & View Toggle */}
            <div className="todo-toolbar">
                <div className="todo-toolbar-left">
                    {/* Circle Select Dropdown */}
                    <div className="todo-circle-select-wrap">
                        <FilterListIcon className="todo-toolbar-icon" />
                        <select
                            className="todo-circle-select"
                            value={selectedClassId}
                            onChange={(e) => dispatch(setSelectedClassId(e.target.value))}
                        >
                            <option value="all">All circles</option>
                            {allClassesList.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search Field */}
                    <div className="todo-search-wrap">
                        <SearchIcon className="todo-toolbar-icon" />
                        <input
                            type="text"
                            placeholder="Search assignments..."
                            value={searchQuery}
                            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                            className="todo-search-input"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="todo-search-clear-btn"
                                onClick={() => dispatch(setSearchQuery(''))}
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        )}
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="todo-toolbar-right">
                    <div className="todo-view-toggle-group">
                        <Tooltip title="Group by due date">
                            <button
                                type="button"
                                className={`todo-toggle-btn ${groupBy === 'time' ? 'active' : ''}`}
                                onClick={() => dispatch(setGroupBy('time'))}
                            >
                                <CalendarMonthIcon fontSize="small" />
                                <span className="toggle-label">Date</span>
                            </button>
                        </Tooltip>
                        <Tooltip title="Group by circle">
                            <button
                                type="button"
                                className={`todo-toggle-btn ${groupBy === 'circle' ? 'active' : ''}`}
                                onClick={() => dispatch(setGroupBy('circle'))}
                            >
                                <ClassOutlinedIcon fontSize="small" />
                                <span className="toggle-label">Circle</span>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="todo-content-area">
                {loading ? (
                    <div className="todo-loading-state">
                        <LoaderComponent />
                        <p>Loading assignments...</p>
                    </div>
                ) : groupedSections.length > 0 ? (
                    <div className="todo-sections-stack">
                        {groupedSections.map((section) => {
                            const isCollapsed = Boolean(collapsedSections[section.key]);

                            return (
                                <div key={section.key} className="todo-section-card">
                                    {/* Section Header */}
                                    <div
                                        className="todo-section-header"
                                        onClick={() => toggleSection(section.key)}
                                    >
                                        <div className="todo-section-header-left">
                                            <span
                                                className="todo-section-dot"
                                                style={{ backgroundColor: section.color }}
                                            />
                                            <h3 className="todo-section-title">{section.title}</h3>
                                            {section.subtitle && (
                                                <span className="todo-section-subtitle">{section.subtitle}</span>
                                            )}
                                        </div>

                                        <div className="todo-section-header-right">
                                            <span className="todo-section-count-tag">
                                                {section.items.length}
                                            </span>
                                            <IconButton size="small" className="todo-collapse-icon-btn">
                                                {isCollapsed ? (
                                                    <ExpandMoreIcon fontSize="small" />
                                                ) : (
                                                    <ExpandLessIcon fontSize="small" />
                                                )}
                                            </IconButton>
                                        </div>
                                    </div>

                                    {/* Assignment Items List */}
                                    {!isCollapsed && (
                                        <div className="todo-assignment-list">
                                            {section.items.map((ass) => {
                                                const itemTheme =
                                                    !ass.classInfo?.classTheme || ass.classInfo?.classTheme === "#FFFFFF"
                                                        ? activeThemeColor
                                                        : ass.classInfo?.classTheme;
                                                const dueInfo = formatDueDate(ass.dueDate);
                                                const studentSubmission = ass.submission?.[0];

                                                return (
                                                    <div
                                                        key={ass._id}
                                                        className="todo-assignment-item"
                                                        style={{ '--item-theme': itemTheme }}
                                                        onClick={() =>
                                                            navigate(
                                                                `/workarea/circle/${ass.classInfo?._id}/assignment/${ass._id}`
                                                            )
                                                        }
                                                    >
                                                        <div className="todo-item-left">
                                                            <div
                                                                className={`todo-item-icon-wrapper ${
                                                                    activeTab === 'Done'
                                                                        ? 'done'
                                                                        : activeTab === 'Missing'
                                                                        ? 'missing'
                                                                        : 'assigned'
                                                                }`}
                                                                style={
                                                                    activeTab === 'Assigned'
                                                                        ? { backgroundColor: itemTheme }
                                                                        : {}
                                                                }
                                                            >
                                                                {activeTab === 'Done' ? (
                                                                    <CheckCircleIcon fontSize="small" />
                                                                ) : activeTab === 'Missing' ? (
                                                                    <WarningAmberIcon fontSize="small" />
                                                                ) : (
                                                                    <AssignmentIcon fontSize="small" />
                                                                )}
                                                            </div>

                                                            <div className="todo-item-meta">
                                                                <h4 className="todo-assignment-name">
                                                                    {ass.name}
                                                                </h4>

                                                                <div className="todo-assignment-submeta">
                                                                    <span
                                                                        className="todo-class-tag"
                                                                        style={{
                                                                            color: itemTheme,
                                                                            borderColor: `${itemTheme}35`,
                                                                            backgroundColor: `${itemTheme}12`
                                                                        }}
                                                                    >
                                                                        {ass.classInfo?.name || "Circle"}
                                                                    </span>

                                                                    {ass.category?.name && (
                                                                        <span className="todo-topic-tag">
                                                                            <FolderOutlinedIcon
                                                                                fontSize="inherit"
                                                                                className="tag-icon"
                                                                            />
                                                                            {ass.category.name}
                                                                        </span>
                                                                    )}

                                                                    {ass.teacher && (
                                                                        <span className="todo-teacher-name">
                                                                            {ass.teacher.firstName} {ass.teacher.lastName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="todo-item-right">
                                                            <div
                                                                className={`todo-due-status ${
                                                                    activeTab === 'Done'
                                                                        ? 'status-done'
                                                                        : activeTab === 'Missing'
                                                                        ? 'status-missing'
                                                                        : dueInfo.isOverdue
                                                                        ? 'status-overdue'
                                                                        : dueInfo.isUrgent
                                                                        ? 'status-urgent'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <AccessTimeIcon fontSize="inherit" className="status-icon" />
                                                                <span>
                                                                    {activeTab === 'Done'
                                                                        ? (studentSubmission?.submitDate
                                                                            ? `Turned in ${new Date(studentSubmission.submitDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                                                            : "Turned in")
                                                                        : activeTab === 'Missing'
                                                                        ? `Missing • ${dueInfo.text.replace("Overdue (was due ", "Due ").replace(")", "")}`
                                                                        : dueInfo.text}
                                                                </span>
                                                            </div>

                                                            <ChevronRightIcon className="todo-item-chevron" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Humanized Clean Empty State */
                    <div className="todo-empty-state">
                        <div className={`todo-empty-icon-circle ${activeTab.toLowerCase()}`}>
                            {activeTab === 'Missing' ? (
                                <AssignmentTurnedInIcon className="empty-icon" />
                            ) : activeTab === 'Done' ? (
                                <CheckCircleOutlineIcon className="empty-icon" />
                            ) : (
                                <AssignmentTurnedInIcon className="empty-icon" />
                            )}
                        </div>

                        <h2 className="todo-empty-title">
                            {searchQuery
                                ? "No matching assignments found"
                                : activeTab === 'Missing'
                                ? "No missing assignments"
                                : activeTab === 'Done'
                                ? "No completed work yet"
                                : "Woohoo, no work due soon!"}
                        </h2>

                        <p className="todo-empty-description">
                            {searchQuery
                                ? "Check your search keywords or clear the filter to view all work."
                                : activeTab === 'Missing'
                                ? "Great job! You have submitted all assignments on time."
                                : activeTab === 'Done'
                                ? "Assignments you submit will appear here in your completion history."
                                : "Enjoy your free time! When teachers assign new work, it will appear here."}
                        </p>

                        {searchQuery && (
                            <button
                                type="button"
                                className="todo-empty-clear-btn"
                                onClick={() => dispatch(setSearchQuery(''))}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

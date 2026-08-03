import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTodoAssignments } from "../../../../Api/apiCaller/todoapicaller";
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
    WarningAmber as WarningAmberIcon,
    FilterList as FilterListIcon,
    AccessTime as AccessTimeIcon,
    FolderOutlined as FolderOutlinedIcon,
    ChevronRight as ChevronRightIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    CalendarMonth as CalendarMonthIcon,
    ClassOutlined as ClassOutlinedIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    School as SchoolIcon,
    CheckCircle as CheckCircleIcon,
    TrendingUp as TrendingUpIcon,
    Refresh as RefreshIcon,
    OpenInNew as OpenInNewIcon
} from "@mui/icons-material";
import {
    Divider,
    IconButton,
    Tooltip,
    LinearProgress,
    Chip,
    Button
} from "@mui/material";
import "./todo.css";

// Helper for formatting time and relative due dates
const formatDueDate = (dateStr) => {
    if (!dateStr) return { text: "No due date", isUrgent: false, isOverdue: false };
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { text: "No due date", isUrgent: false, isOverdue: false };

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
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
        // Overdue
        if (isYesterday) return { text: `Due yesterday at ${timeStr}`, isUrgent: true, isOverdue: true };
        if (Math.abs(diffDays) === 0) return { text: `Overdue (was due ${timeStr})`, isUrgent: true, isOverdue: true };
        return { text: `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`, isUrgent: true, isOverdue: true };
    }

    if (isToday) {
        return { text: `Due today at ${timeStr}`, isUrgent: true, isOverdue: false };
    }
    if (isTomorrow) {
        return { text: `Due tomorrow at ${timeStr}`, isUrgent: diffHours <= 36, isOverdue: false };
    }

    return {
        text: `Due ${date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
        })} at ${timeStr}`,
        isUrgent: false,
        isOverdue: false
    };
};

// Categorize assignment into date buckets
const getDateBucket = (dateStr, tabType) => {
    if (!dateStr || isNaN(new Date(dateStr).getTime())) {
        return "No due date";
    }

    const date = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffDays = Math.floor((date.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));

    if (tabType === "Assigned") {
        if (diffDays <= 7) return "This week";
        if (diffDays <= 14) return "Next week";
        return "Later";
    } else {
        // For Missing or Done
        if (diffDays >= -7) return "This week";
        if (diffDays >= -14) return "Last week";
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
    const isRefreshing = useSelector((state) => state.todo?.isRefreshing) || false;

    const joinedClasses = useSelector((state) => state.classes?.joinedClassesAsStudent) || [];

    // Local Collapsible Sections State
    const [collapsedSections, setCollapsedSections] = useState({});

    const toggleSection = (sectionKey) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    // Fetch todos action
    const fetchTodos = useCallback((isSilent = false) => {
        dispatch(getTodoAssignments({ classId: selectedClassId, isSilent }));
    }, [dispatch, selectedClassId]);

    // Initial fetch on mount or class filter change
    useEffect(() => {
        fetchTodos(false);
    }, [fetchTodos]);

    // Live Socket.IO Synchronization
    useEffect(() => {
        const handleLiveUpdate = () => {
            fetchTodos(true);
        };

        socket.on("todo:updated", handleLiveUpdate);
        socket.on("assignment:new", handleLiveUpdate);
        socket.on("assignment:updated", handleLiveUpdate);
        socket.on("assignment:deleted", handleLiveUpdate);
        socket.on("assignment:submitted", handleLiveUpdate);
        socket.on("assignment:submission_updated", handleLiveUpdate);
        socket.on("assignment:submission_deleted", handleLiveUpdate);

        return () => {
            socket.off("todo:updated", handleLiveUpdate);
            socket.off("assignment:new", handleLiveUpdate);
            socket.off("assignment:updated", handleLiveUpdate);
            socket.off("assignment:deleted", handleLiveUpdate);
            socket.off("assignment:submitted", handleLiveUpdate);
            socket.off("assignment:submission_updated", handleLiveUpdate);
            socket.off("assignment:submission_deleted", handleLiveUpdate);
        };
    }, [fetchTodos]);

    // Calculate dynamic counts for badges and stats
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
                const teacherMatch = ass.teacher && `${ass.teacher.firstName || ''} ${ass.teacher.lastName || ''}`.toLowerCase().includes(query);

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

    // Grouping by Date or Circle
    const groupedSections = useMemo(() => {
        if (groupBy === 'circle') {
            const classMap = {};
            filteredAssignments.forEach((ass) => {
                const classId = ass.classInfo?._id || 'unknown';
                if (!classMap[classId]) {
                    classMap[classId] = {
                        title: ass.classInfo?.name || "Circle",
                        subtitle: ass.classInfo?.className || ass.classInfo?.subject || "",
                        color: ass.classInfo?.classTheme || "#00a896",
                        items: []
                    };
                }
                classMap[classId].items.push(ass);
            });
            return Object.entries(classMap).map(([key, val]) => ({ key, ...val }));
        } else {
            // Group by Time Bucket
            const bucketOrder = activeTab === "Assigned"
                ? ["No due date", "This week", "Next week", "Later"]
                : ["This week", "Last week", "Earlier", "No due date"];

            const bucketMap = {};
            bucketOrder.forEach(b => {
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
                .filter(bucket => (bucketMap[bucket] && bucketMap[bucket].length > 0))
                .map(bucket => ({
                    key: bucket,
                    title: bucket,
                    subtitle: `${bucketMap[bucket].length} ${bucketMap[bucket].length === 1 ? 'assignment' : 'assignments'}`,
                    color: activeTab === 'Missing' ? '#ef4444' : activeTab === 'Done' ? '#10b981' : '#00a896',
                    items: bucketMap[bucket]
                }));
        }
    }, [filteredAssignments, groupBy, activeTab]);

    return (
        <div className="todo-dashboard-container">
            {/* Silent Background Refresh Progress Bar */}
            {isRefreshing && <LinearProgress color="primary" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 3 }} />}

            {/* Top Header & Stats */}
            <div className="todo-hero-header">
                <div className="todo-title-row">
                    <div>
                        <h1 className="todo-main-title">To-do</h1>
                        <p className="todo-main-subtitle">
                            Organize, track, and submit your Circle assignments on time.
                        </p>
                    </div>

                    <div className="todo-header-actions">
                        <Tooltip title="Refresh To-Dos">
                            <IconButton onClick={() => fetchTodos(false)} className="refresh-btn" size="small">
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>

                {/* 3 Interactive Stat Cards */}
                <div className="todo-metrics-grid">
                    <div
                        className={`metric-card assigned ${activeTab === 'Assigned' ? 'selected' : ''}`}
                        onClick={() => dispatch(setActiveTab('Assigned'))}
                    >
                        <div className="metric-icon-wrap assigned">
                            <AssignmentIcon />
                        </div>
                        <div className="metric-details">
                            <span className="metric-number">{assignedCount}</span>
                            <span className="metric-label">Assigned Work</span>
                        </div>
                    </div>

                    <div
                        className={`metric-card missing ${activeTab === 'Missing' ? 'selected' : ''}`}
                        onClick={() => dispatch(setActiveTab('Missing'))}
                    >
                        <div className="metric-icon-wrap missing">
                            <WarningAmberIcon />
                        </div>
                        <div className="metric-details">
                            <span className="metric-number">{missingCount}</span>
                            <span className="metric-label">Missing / Overdue</span>
                        </div>
                    </div>

                    <div
                        className={`metric-card done ${activeTab === 'Done' ? 'selected' : ''}`}
                        onClick={() => dispatch(setActiveTab('Done'))}
                    >
                        <div className="metric-icon-wrap done">
                            <CheckCircleIcon />
                        </div>
                        <div className="metric-details">
                            <span className="metric-number">{doneCount}</span>
                            <span className="metric-label">Completed</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Bar: Tabs, Filter & Grouping */}
            <div className="todo-controls-bar">
                {/* Main Tabs */}
                <div className="todo-tab-pills">
                    <button
                        type="button"
                        className={`tab-pill-btn ${activeTab === 'Assigned' ? 'active assigned' : ''}`}
                        onClick={() => dispatch(setActiveTab('Assigned'))}
                    >
                        <span>Assigned</span>
                        <span className="pill-badge">{assignedCount}</span>
                    </button>

                    <button
                        type="button"
                        className={`tab-pill-btn ${activeTab === 'Missing' ? 'active missing' : ''}`}
                        onClick={() => dispatch(setActiveTab('Missing'))}
                    >
                        <span>Missing</span>
                        <span className="pill-badge">{missingCount}</span>
                    </button>

                    <button
                        type="button"
                        className={`tab-pill-btn ${activeTab === 'Done' ? 'active done' : ''}`}
                        onClick={() => dispatch(setActiveTab('Done'))}
                    >
                        <span>Done</span>
                        <span className="pill-badge">{doneCount}</span>
                    </button>
                </div>

                {/* Filter and View Controls */}
                <div className="todo-secondary-controls">
                    {/* Search Box */}
                    <div className="todo-search-field">
                        <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search assignments..."
                            value={searchQuery}
                            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                        />
                        {searchQuery && (
                            <IconButton size="small" onClick={() => dispatch(setSearchQuery(''))}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </div>

                    {/* Circle Filter Dropdown */}
                    <div className="todo-class-dropdown-wrapper">
                        <FilterListIcon fontSize="small" sx={{ color: '#64748b' }} />
                        <select
                            className="todo-class-select-input"
                            value={selectedClassId}
                            onChange={(e) => dispatch(setSelectedClassId(e.target.value))}
                        >
                            <option value="all">All Circles</option>
                            {joinedClasses.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Group By Toggle */}
                    <div className="todo-view-toggle">
                        <Tooltip title="Group by Due Date">
                            <button
                                type="button"
                                className={`toggle-btn ${groupBy === 'time' ? 'active' : ''}`}
                                onClick={() => dispatch(setGroupBy('time'))}
                            >
                                <CalendarMonthIcon fontSize="small" />
                            </button>
                        </Tooltip>
                        <Tooltip title="Group by Circle">
                            <button
                                type="button"
                                className={`toggle-btn ${groupBy === 'circle' ? 'active' : ''}`}
                                onClick={() => dispatch(setGroupBy('circle'))}
                            >
                                <ClassOutlinedIcon fontSize="small" />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Main Content Stream */}
            <div className="todo-content-stream">
                {loading ? (
                    <div className="todo-loading-state">
                        <LoaderComponent />
                        <p>Loading assignments...</p>
                    </div>
                ) : groupedSections.length > 0 ? (
                    groupedSections.map((section) => {
                        const isCollapsed = Boolean(collapsedSections[section.key]);

                        return (
                            <div key={section.key} className="todo-group-card">
                                {/* Section Header */}
                                <div
                                    className="todo-group-card-header"
                                    onClick={() => toggleSection(section.key)}
                                    style={{ borderLeftColor: section.color }}
                                >
                                    <div className="group-header-info">
                                        <h3 className="group-title">{section.title}</h3>
                                        {section.subtitle && <span className="group-subtitle">{section.subtitle}</span>}
                                    </div>
                                    <div className="group-header-right">
                                        <span className="group-count-pill">{section.items.length}</span>
                                        <IconButton size="small" className="collapse-btn">
                                            {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                                        </IconButton>
                                    </div>
                                </div>

                                {/* Items List */}
                                {!isCollapsed && (
                                    <div className="todo-card-items-list">
                                        {section.items.map((ass) => {
                                            const classTheme = ass.classInfo?.classTheme || "#00a896";
                                            const dueInfo = formatDueDate(ass.dueDate);
                                            const studentSubmission = ass.submission?.[0];

                                            return (
                                                <div
                                                    key={ass._id}
                                                    className="todo-assignment-row"
                                                    onClick={() => navigate(`/workarea/circle/${ass.classInfo?._id}/assignment/${ass._id}`)}
                                                >
                                                    <div className="row-left">
                                                        <div
                                                            className={`assignment-avatar-pill ${activeTab === 'Missing' ? 'missing' : activeTab === 'Done' ? 'done' : 'assigned'}`}
                                                            style={activeTab === 'Assigned' ? { backgroundColor: classTheme } : {}}
                                                        >
                                                            {activeTab === 'Done' ? (
                                                                <CheckCircleOutlineIcon fontSize="small" />
                                                            ) : activeTab === 'Missing' ? (
                                                                <WarningAmberIcon fontSize="small" />
                                                            ) : (
                                                                <AssignmentIcon fontSize="small" />
                                                            )}
                                                        </div>

                                                        <div className="assignment-meta-block">
                                                            <h4 className="assignment-title-text">{ass.name}</h4>
                                                            <div className="assignment-chips-row">
                                                                <span
                                                                    className="class-chip"
                                                                    style={{ borderColor: `${classTheme}40`, color: classTheme, backgroundColor: `${classTheme}10` }}
                                                                >
                                                                    {ass.classInfo?.name || "Circle"}
                                                                </span>

                                                                {ass.category?.name && (
                                                                    <span className="topic-chip">
                                                                        <FolderOutlinedIcon fontSize="inherit" />
                                                                        {ass.category.name}
                                                                    </span>
                                                                )}

                                                                {ass.teacher && (
                                                                    <span className="teacher-chip">
                                                                        {ass.teacher.firstName} {ass.teacher.lastName}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row-right">
                                                        <div className={`due-info-tag ${dueInfo.isOverdue ? 'overdue' : dueInfo.isUrgent ? 'urgent' : activeTab === 'Done' ? 'done' : ''}`}>
                                                            <AccessTimeIcon fontSize="inherit" />
                                                            <span>
                                                                {activeTab === 'Done'
                                                                    ? (studentSubmission?.submitDate
                                                                        ? `Turned in ${new Date(studentSubmission.submitDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}`
                                                                        : "Turned In")
                                                                    : dueInfo.text}
                                                            </span>
                                                        </div>
                                                        <ChevronRightIcon className="row-chevron" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    /* Clean Empty State */
                    <div className="todo-empty-state-card">
                        <div className={`empty-state-icon-circle ${activeTab === 'Missing' ? 'missing' : activeTab === 'Done' ? 'done' : 'assigned'}`}>
                            {activeTab === 'Missing' ? (
                                <CheckCircleOutlineIcon fontSize="large" sx={{ color: '#10b981' }} />
                            ) : activeTab === 'Done' ? (
                                <AssignmentIcon fontSize="large" sx={{ color: '#00a896' }} />
                            ) : (
                                <CheckCircleOutlineIcon fontSize="large" sx={{ color: '#10b981' }} />
                            )}
                        </div>

                        <h2>
                            {searchQuery
                                ? "No matching assignments found"
                                : activeTab === 'Missing'
                                    ? "No missing assignments!"
                                    : activeTab === 'Done'
                                        ? "No completed assignments yet"
                                        : "All caught up! No pending work"}
                        </h2>

                        <p>
                            {searchQuery
                                ? "Try adjusting your search keywords or clear the filter."
                                : activeTab === 'Missing'
                                    ? "Awesome job! You have submitted all assignments on time."
                                    : activeTab === 'Done'
                                        ? "Turn in your assignments to view your completion history here."
                                        : "You have no active assignments due right now. Enjoy your free time!"}
                        </p>

                        {searchQuery && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => dispatch(setSearchQuery(''))}
                                sx={{ mt: 2, textTransform: 'none', borderRadius: '8px' }}
                            >
                                Clear search
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

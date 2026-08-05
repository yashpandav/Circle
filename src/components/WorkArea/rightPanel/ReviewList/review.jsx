import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
    getPendingReviews,
    addIntoReviewed,
    removeFromReviewed
} from "../../../../Api/apiCaller/reviewapicaller";
import { joinedClass } from "../../../../Api/apiCaller/userapicaller";
import {
    setSelectedClassId,
    setActiveTab,
    setGroupBy,
    setSearchQuery
} from "../../../../Slices/reviewSlice";
import CircleDropdown from "../../../Helper/CircleDropdown";
import GradeSubmissionModal from "../../../Helper/GradeSubmissionModal";
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import socket from "../../../../socket/socket";
import {
    Assignment as AssignmentIcon,
    RateReviewOutlined as RateReviewIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    AccessTime as AccessTimeIcon,
    FolderOutlined as FolderOutlinedIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    CalendarMonthOutlined as CalendarMonthIcon,
    ClassOutlined as ClassOutlinedIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    OpenInNew as OpenInNewIcon,
    AttachFile as AttachFileIcon,
    Grade as GradeIcon,
    PeopleAltOutlined as PeopleIcon
} from "@mui/icons-material";
import { IconButton, Tooltip, Button, Avatar } from "@mui/material";
import "./review.css";

const EMPTY_ARRAY = [];

// Helper for formatting due dates in a clean, human-readable format
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
        return { text: `Overdue (${Math.abs(diffDays)}d ago)`, isUrgent: true, isOverdue: true };
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

    if (tabType === "To Review") {
        if (diffDays < 0) return "Past due / Needs grading";
        if (diffDays <= 7) return "Due this week";
        if (diffDays <= 14) return "Due next week";
        return "Due later";
    } else {
        if (diffDays >= -7 && diffDays <= 0) return "This week";
        if (diffDays >= -14 && diffDays < -7) return "Last week";
        return "Earlier";
    }
};

export default function Review() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const filterAssId = queryParams.get("assId");

    // Redux State
    const rawReviewData = useSelector((state) => state.review?.reviewData);
    const reviewData = rawReviewData || EMPTY_ARRAY;

    const selectedClassId = useSelector((state) => state.review?.selectedClassId) || 'all';
    const activeTab = useSelector((state) => state.review?.activeTab) || 'To Review';
    const groupBy = useSelector((state) => state.review?.groupBy) || 'time';
    const searchQuery = useSelector((state) => state.review?.searchQuery) || '';
    const loading = useSelector((state) => state.review?.loading) || false;
    const isRefreshing = useSelector((state) => state.review?.isRefreshing) || false;

    const currClass = useSelector((state) => state.classes?.currClass);
    const joinedClassesAsTeacher = useSelector((state) => state.classes?.joinedClassesAsTeacher);
    const createdClasses = useSelector((state) => state.classes?.createdClasses);

    // Collapsed sections tracking
    const [collapsedSections, setCollapsedSections] = useState({});
    // Expanded submissions drawers for assignments
    const [expandedAssignments, setExpandedAssignments] = useState({});

    // Grading Modal State
    const [gradingModal, setGradingModal] = useState({
        open: false,
        assignment: null,
        submission: null,
        themeColor: '#00a896'
    });

    // Fetch teaching classes if not already loaded
    useEffect(() => {
        if (joinedClassesAsTeacher === null || createdClasses === null) {
            dispatch(joinedClass());
        }
    }, [dispatch, joinedClassesAsTeacher, createdClasses]);

    // Aggregate all teaching/created classes for dropdown
    const teachingClassesList = useMemo(() => {
        const teacher = Array.isArray(joinedClassesAsTeacher) ? joinedClassesAsTeacher : [];
        const created = Array.isArray(createdClasses) ? createdClasses : [];

        const map = new Map();
        [...created, ...teacher].forEach((c) => {
            if (c && c._id && !map.has(c._id)) {
                map.set(c._id, c);
            }
        });

        // Also add any classes present in reviewData
        if (Array.isArray(reviewData)) {
            reviewData.forEach((rd) => {
                const cId = rd.classId?._id || rd.classId;
                if (cId && !map.has(cId)) {
                    map.set(cId, {
                        _id: cId,
                        name: rd.className || rd.classId?.name || "Classroom",
                        classTheme: rd.classTheme || rd.classId?.classTheme || "#00a896"
                    });
                }
            });
        }

        return Array.from(map.values());
    }, [joinedClassesAsTeacher, createdClasses, reviewData]);

    // Theme color resolution
    const activeThemeColor = useMemo(() => {
        if (selectedClassId && selectedClassId !== 'all') {
            const found = teachingClassesList.find((c) => c._id === selectedClassId);
            if (found?.classTheme && found.classTheme !== '#FFFFFF') {
                return found.classTheme;
            }
        }
        if (currClass?.classTheme && currClass.classTheme !== '#FFFFFF') {
            return currClass.classTheme;
        }
        for (const c of teachingClassesList) {
            if (c.classTheme && c.classTheme !== '#FFFFFF') {
                return c.classTheme;
            }
        }
        return '#00a896';
    }, [selectedClassId, teachingClassesList, currClass]);

    const toggleSection = (sectionKey) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    const toggleAssignmentDrawer = (e, assId) => {
        e.stopPropagation();
        setExpandedAssignments((prev) => ({
            ...prev,
            [assId]: !prev[assId]
        }));
    };

    // Fetch review data
    const fetchReviews = useCallback((isSilent = false) => {
        dispatch(getPendingReviews({ classId: selectedClassId, isSilent }));
    }, [dispatch, selectedClassId]);

    useEffect(() => {
        fetchReviews(false);
    }, [fetchReviews]);

    // Real-time synchronization
    useEffect(() => {
        const handleLiveUpdate = () => {
            fetchReviews(true);
        };

        const events = [
            "review:updated",
            "assignment:graded",
            "assignment:submitted",
            "assignment:submission_updated",
            "assignment:submission_deleted",
            "assignment:new",
            "assignment:updated",
            "assignment:deleted",
            "todo:updated"
        ];

        events.forEach((evt) => socket.on(evt, handleLiveUpdate));

        return () => {
            events.forEach((evt) => socket.off(evt, handleLiveUpdate));
        };
    }, [fetchReviews]);

    // Dynamic badge counts
    const { toReviewCount, reviewedCount } = useMemo(() => {
        let toRev = 0;
        let rev = 0;

        if (Array.isArray(reviewData)) {
            reviewData.forEach((classItem) => {
                const notRevList = classItem.notReviedAss || classItem.assignmentId || [];
                const revList = classItem.reviewdAss || classItem.reviewed || [];
                if (Array.isArray(notRevList)) {
                    toRev += notRevList.length;
                }
                if (Array.isArray(revList)) {
                    rev += revList.length;
                }
            });
        }

        return { toReviewCount: toRev, reviewedCount: rev };
    }, [reviewData]);

    // Filter assignments according to search and selected circle
    const filteredAssignments = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const items = [];

        if (!Array.isArray(reviewData)) return items;

        reviewData.forEach((classItem) => {
            const classObj = classItem.classId || {};
            const classIdStr = classObj._id || classItem.classId;

            if (selectedClassId !== 'all' && classIdStr !== selectedClassId) {
                return;
            }

            const rawList = activeTab === "To Review"
                ? (classItem.notReviedAss || classItem.assignmentId)
                : (classItem.reviewdAss || classItem.reviewed);
            const list = Array.isArray(rawList) ? rawList : [];

            list.forEach((ass) => {
                if (!ass || typeof ass !== 'object') return;

                if (filterAssId && String(ass._id) !== String(filterAssId)) {
                    return;
                }

                const nameMatch = ass.name?.toLowerCase().includes(query);
                const descMatch = ass.description?.toLowerCase().includes(query);
                const catMatch = ass.category?.name?.toLowerCase().includes(query);
                const classNameMatch = (classItem.className || classObj.name || '').toLowerCase().includes(query);

                if (!query || nameMatch || descMatch || catMatch || classNameMatch) {
                    items.push({
                        ...ass,
                        classId: classIdStr,
                        className: classItem.className || classObj.name || "Untitled Circle",
                        classTheme: classItem.classTheme || classObj.classTheme || activeThemeColor
                    });
                }
            });
        });

        return items;
    }, [reviewData, selectedClassId, activeTab, filterAssId, searchQuery, activeThemeColor]);

    // Grouping logic
    const groupedSections = useMemo(() => {
        if (groupBy === 'circle') {
            const classMap = {};
            filteredAssignments.forEach((ass) => {
                const cId = ass.classId || 'unknown';
                if (!classMap[cId]) {
                    classMap[cId] = {
                        key: cId,
                        title: ass.className || "Circle Classroom",
                        theme: ass.classTheme || activeThemeColor,
                        items: []
                    };
                }
                classMap[cId].items.push(ass);
            });

            return Object.values(classMap).map((cls) => ({
                key: cls.key,
                title: cls.title,
                subtitle: `${cls.items.length} ${cls.items.length === 1 ? 'assignment' : 'assignments'}`,
                color: cls.theme,
                items: cls.items
            }));
        } else {
            // Group by Time Buckets
            const bucketOrder = activeTab === "To Review"
                ? ["Past due / Needs grading", "Due this week", "Due next week", "Due later", "No due date"]
                : ["This week", "Last week", "Earlier", "No due date"];

            const bucketMap = {};
            bucketOrder.forEach((b) => {
                bucketMap[b] = [];
            });

            filteredAssignments.forEach((ass) => {
                const b = getDateBucket(ass.dueDate, activeTab);
                if (!bucketMap[b]) bucketMap[b] = [];
                bucketMap[b].push(ass);
            });

            return bucketOrder
                .filter((b) => bucketMap[b] && bucketMap[b].length > 0)
                .map((bucket) => ({
                    key: bucket,
                    title: bucket,
                    subtitle: `${bucketMap[bucket].length} ${bucketMap[bucket].length === 1 ? 'assignment' : 'assignments'}`,
                    color: activeTab === "To Review" ? '#00a896' : '#16a34a',
                    items: bucketMap[bucket]
                }));
        }
    }, [filteredAssignments, groupBy, activeTab, activeThemeColor]);

    const handleMarkReviewed = async (e, assId) => {
        e.stopPropagation();
        await dispatch(addIntoReviewed(assId));
    };

    const handleMarkPending = async (e, assId) => {
        e.stopPropagation();
        await dispatch(removeFromReviewed(assId));
    };

    const handleAssignmentClick = (classId, assId) => {
        if (classId && assId) {
            navigate(`/workarea/circle/${classId}/assignment/${assId}`);
        }
    };

    const handleOpenGrading = (e, ass, sub, themeColor) => {
        e.stopPropagation();
        setGradingModal({
            open: true,
            assignment: ass,
            submission: sub,
            themeColor: themeColor || activeThemeColor
        });
    };

    const handleGradeSaved = () => {
        fetchReviews(true);
    };

    return (
        <div className="task-page-container" style={{ '--class-theme': activeThemeColor }}>
            {/* 1. Header Bar */}
            <div className="task-header-bar">
                <div className="task-header-left">
                    <h1 className="task-page-title">To-review</h1>
                </div>

                <div className="task-header-right">
                    <Tooltip title="Refresh review list">
                        <IconButton
                            onClick={() => fetchReviews(false)}
                            className={`task-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
                            size="small"
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* 2. Navigation Tabs (Underline Style matching Circle Standard) */}
            <div className="task-tabs-container">
                <div className="task-tabs-list">
                    <button
                        type="button"
                        className={`task-tab ${activeTab === 'To Review' ? 'active' : ''}`}
                        onClick={() => dispatch(setActiveTab('To Review'))}
                    >
                        <span>To review</span>
                        <span className="task-tab-badge">{toReviewCount}</span>
                    </button>

                    <button
                        type="button"
                        className={`task-tab ${activeTab === 'Reviewed' ? 'active done' : ''}`}
                        onClick={() => dispatch(setActiveTab('Reviewed'))}
                    >
                        <span>Reviewed</span>
                        <span className="task-tab-badge done">{reviewedCount}</span>
                    </button>
                </div>

                {filterAssId && (
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Filtered to single assignment</span>
                        <Button
                            size="small"
                            variant="text"
                            onClick={() => navigate('/workarea/review')}
                            sx={{ textTransform: 'none', fontSize: '12px', ml: 1, color: activeThemeColor }}
                        >
                            Clear
                        </Button>
                    </div>
                )}
            </div>

            {/* 3. Toolbar: Circle Filter, Search & View Toggle */}
            <div className="task-toolbar">
                <div className="task-toolbar-left">
                    {/* Circle Dropdown */}
                    <CircleDropdown
                        selectedCircleId={selectedClassId}
                        onSelectCircle={(id) => dispatch(setSelectedClassId(id))}
                        circlesList={teachingClassesList}
                        themeColor={activeThemeColor}
                    />

                    {/* Search Field */}
                    <div className="task-search-wrap">
                        <SearchIcon className="task-toolbar-icon" fontSize="small" />
                        <input
                            type="text"
                            placeholder="Search assignments..."
                            value={searchQuery}
                            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                            className="task-search-input"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="task-search-clear-btn"
                                onClick={() => dispatch(setSearchQuery(''))}
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        )}
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="task-toolbar-right">
                    <div className="task-view-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${groupBy === 'time' ? 'active' : ''}`}
                            onClick={() => dispatch(setGroupBy('time'))}
                            title="Group by due date"
                        >
                            <CalendarMonthIcon fontSize="small" />
                            <span>Date</span>
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${groupBy === 'circle' ? 'active' : ''}`}
                            onClick={() => dispatch(setGroupBy('circle'))}
                            title="Group by circle"
                        >
                            <ClassOutlinedIcon fontSize="small" />
                            <span>Circle</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. Main Content Area */}
            <div className="task-content-area">
                {loading && !isRefreshing ? (
                    <div className="task-loading-state">
                        <LoaderComponent />
                        <p style={{ marginTop: '12px' }}>Loading reviews...</p>
                    </div>
                ) : groupedSections.length > 0 ? (
                    <div className="task-sections-stack">
                        {groupedSections.map((section) => {
                            const isCollapsed = Boolean(collapsedSections[section.key]);

                            return (
                                <div key={section.key} className="task-section-card">
                                    {/* Section Header */}
                                    <div
                                        className="task-section-header"
                                        onClick={() => toggleSection(section.key)}
                                    >
                                        <div className="task-section-header-left">
                                            <span
                                                className="task-section-dot"
                                                style={{ backgroundColor: section.color }}
                                            />
                                            <h3 className="task-section-title">{section.title}</h3>
                                            {section.subtitle && (
                                                <span className="task-section-subtitle">{section.subtitle}</span>
                                            )}
                                        </div>

                                        <div className="task-section-header-right">
                                            <span className="task-section-count-tag">
                                                {section.items.length}
                                            </span>
                                            <IconButton size="small" className="task-collapse-icon-btn">
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
                                        <div className="task-assignment-list">
                                            {section.items.map((ass) => {
                                                const itemTheme = ass.classTheme || activeThemeColor;
                                                const dueInfo = formatDueDate(ass.dueDate);
                                                const submissions = Array.isArray(ass.submission) ? ass.submission : [];
                                                const submissionsCount = submissions.length;
                                                const pendingCount = Array.isArray(ass.pendingStudent) ? ass.pendingStudent.length : 0;
                                                const isDrawerExpanded = Boolean(expandedAssignments[ass._id]);

                                                // Count how many are graded (ACCEPTED) vs pending (SUBMITTED)
                                                const gradedCount = submissions.filter(s => s?.status === 'ACCEPTED').length;

                                                return (
                                                    <div key={ass._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <div
                                                            className="task-item-row"
                                                            style={{ '--item-theme': itemTheme, borderBottom: 'none' }}
                                                            onClick={() => handleAssignmentClick(ass.classId, ass._id)}
                                                        >
                                                            <div className="task-item-left">
                                                                <div
                                                                    className="task-item-icon-wrapper"
                                                                    style={{ backgroundColor: itemTheme }}
                                                                >
                                                                    <AssignmentIcon fontSize="small" />
                                                                </div>

                                                                <div className="task-item-meta">
                                                                    <h4 className="task-assignment-name">
                                                                        {ass.name}
                                                                    </h4>

                                                                    <div className="task-assignment-submeta">
                                                                        <span
                                                                            className="task-class-tag"
                                                                            style={{
                                                                                color: itemTheme,
                                                                                borderColor: `${itemTheme}35`,
                                                                                backgroundColor: `${itemTheme}12`
                                                                            }}
                                                                        >
                                                                            {ass.className || "Circle"}
                                                                        </span>

                                                                        {ass.category?.name && (
                                                                            <span className="task-topic-tag">
                                                                                <FolderOutlinedIcon
                                                                                    fontSize="inherit"
                                                                                    className="tag-icon"
                                                                                />
                                                                                {ass.category.name}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="task-item-right" onClick={(e) => e.stopPropagation()}>
                                                                {/* Due Date Status */}
                                                                <div
                                                                    className={`task-due-status ${
                                                                        dueInfo.isOverdue
                                                                            ? 'status-overdue'
                                                                            : dueInfo.isUrgent
                                                                            ? 'status-urgent'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <AccessTimeIcon fontSize="inherit" className="status-icon" />
                                                                    <span>{dueInfo.text}</span>
                                                                </div>

                                                                {/* Metrics with click to toggle submissions drawer */}
                                                                <div className="task-review-metrics">
                                                                    <Tooltip title={submissionsCount > 0 ? "Click to view turned in submissions" : "No student submissions yet"}>
                                                                        <div
                                                                            className={`task-metric-pill turned-in ${submissionsCount > 0 ? 'clickable' : ''}`}
                                                                            onClick={(e) => submissionsCount > 0 && toggleAssignmentDrawer(e, ass._id)}
                                                                            style={{ cursor: submissionsCount > 0 ? 'pointer' : 'default' }}
                                                                        >
                                                                            <span className="task-metric-num">{submissionsCount}</span>
                                                                            <span className="task-metric-lbl">Turned in</span>
                                                                        </div>
                                                                    </Tooltip>
                                                                    <div className="task-metric-pill assigned" title={`${pendingCount} students assigned`}>
                                                                        <span className="task-metric-num">{pendingCount}</span>
                                                                        <span className="task-metric-lbl">Assigned</span>
                                                                    </div>
                                                                </div>

                                                                {/* Review Action Buttons */}
                                                                <div className="task-action-wrap">
                                                                    {submissionsCount > 0 && (
                                                                        <button
                                                                            type="button"
                                                                            className={`task-action-btn ${isDrawerExpanded ? 'active' : ''}`}
                                                                            onClick={(e) => toggleAssignmentDrawer(e, ass._id)}
                                                                            title="View student submissions"
                                                                        >
                                                                            <PeopleIcon fontSize="small" />
                                                                            <span>{isDrawerExpanded ? 'Hide work' : 'View work'}</span>
                                                                        </button>
                                                                    )}

                                                                    {activeTab === "To Review" ? (
                                                                        <button
                                                                            type="button"
                                                                            className="task-action-btn"
                                                                            onClick={(e) => handleMarkReviewed(e, ass._id)}
                                                                            title="Mark as reviewed"
                                                                        >
                                                                            <CheckCircleOutlineIcon fontSize="small" />
                                                                            <span>Mark reviewed</span>
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            className="task-action-btn"
                                                                            onClick={(e) => handleMarkPending(e, ass._id)}
                                                                            title="Move back to To-Review"
                                                                        >
                                                                            <RateReviewIcon fontSize="small" />
                                                                            <span>To review</span>
                                                                        </button>
                                                                    )}

                                                                    <Tooltip title="View assignment page">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handleAssignmentClick(ass.classId, ass._id)}
                                                                            className="task-view-details-btn"
                                                                        >
                                                                            <OpenInNewIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Submissions Drawer for Teacher to Grade Student Work */}
                                                        {isDrawerExpanded && (
                                                            <div className="task-submissions-drawer" onClick={(e) => e.stopPropagation()}>
                                                                <div className="task-submissions-drawer-header">
                                                                    <h5 className="task-drawer-title">Student Submissions ({submissions.length})</h5>
                                                                    <span className="task-drawer-stats">
                                                                        {gradedCount} graded / {submissions.length - gradedCount} awaiting grade
                                                                    </span>
                                                                </div>

                                                                {submissions.length > 0 ? (
                                                                    <div className="task-submissions-list">
                                                                        {submissions.map((sub) => {
                                                                            if (!sub) return null;
                                                                            const student = sub.student || {};
                                                                            const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || "Student";
                                                                            const isGraded = sub.status === 'ACCEPTED';
                                                                            const isRejected = sub.status === 'REJECTED';
                                                                            const totalPts = ass.totalMarks || sub.maxMarks || 100;

                                                                            return (
                                                                                <div key={sub._id} className="task-sub-card">
                                                                                    <div className="task-sub-student-info">
                                                                                        <Avatar
                                                                                            src={student.image}
                                                                                            alt={studentName}
                                                                                            className="task-sub-avatar"
                                                                                            sx={{ bgcolor: itemTheme }}
                                                                                        >
                                                                                            {studentName[0] || "S"}
                                                                                        </Avatar>
                                                                                        <div className="task-sub-name-meta">
                                                                                            <span className="task-sub-student-name">{studentName}</span>
                                                                                            <span className="task-sub-time">
                                                                                                {sub.submitDate
                                                                                                    ? `Turned in ${new Date(sub.submitDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                                                                                                    : "Turned in"}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="task-sub-center">
                                                                                        {sub.file && (
                                                                                            <a
                                                                                                href={sub.file}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="task-sub-file-link"
                                                                                                onClick={(e) => e.stopPropagation()}
                                                                                            >
                                                                                                <AttachFileIcon fontSize="inherit" />
                                                                                                <span>Attachment</span>
                                                                                            </a>
                                                                                        )}

                                                                                        {sub.data && (
                                                                                            <span className="task-sub-note-snippet" title={sub.data}>
                                                                                                "{sub.data}"
                                                                                            </span>
                                                                                        )}

                                                                                        <span
                                                                                            className={`task-sub-status-tag ${
                                                                                                isGraded
                                                                                                    ? 'status-accepted'
                                                                                                    : isRejected
                                                                                                    ? 'status-rejected'
                                                                                                    : 'status-submitted'
                                                                                            }`}
                                                                                        >
                                                                                            {isGraded
                                                                                                ? 'Accepted'
                                                                                                : isRejected
                                                                                                ? 'Rejected'
                                                                                                : 'Submitted'}
                                                                                        </span>

                                                                                        {isGraded && (
                                                                                            <span className="task-sub-marks-pill">
                                                                                                {sub.marks} / {totalPts}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="task-sub-actions">
                                                                                        <button
                                                                                            type="button"
                                                                                            className={`task-sub-grade-btn ${isGraded ? 'graded' : ''}`}
                                                                                            onClick={(e) => handleOpenGrading(e, ass, sub, itemTheme)}
                                                                                        >
                                                                                            <GradeIcon fontSize="inherit" />
                                                                                            <span>{isGraded ? 'Edit Grade' : 'Grade'}</span>
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="task-no-subs-msg">No submissions turned in yet.</div>
                                                                )}
                                                            </div>
                                                        )}
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
                    <div className="task-empty-state">
                        <div className={`task-empty-icon-circle ${activeTab === 'Reviewed' ? 'done' : ''}`}>
                            {activeTab === 'Reviewed' ? (
                                <CheckCircleOutlineIcon className="empty-icon" />
                            ) : (
                                <CheckCircleIcon className="empty-icon" />
                            )}
                        </div>

                        <h2 className="task-empty-title">
                            {searchQuery
                                ? "No matching assignments found"
                                : activeTab === 'Reviewed'
                                ? "No reviewed assignments yet"
                                : "Woohoo, all caught up!"}
                        </h2>

                        <p className="task-empty-description">
                            {searchQuery
                                ? "Check your search keywords or clear the filter to view all submissions."
                                : activeTab === 'Reviewed'
                                ? "Assignments you mark as reviewed will appear here in your completion history."
                                : "You have reviewed all student submissions. When new submissions come in, they will appear here."}
                        </p>

                        {searchQuery && (
                            <button
                                type="button"
                                className="task-empty-clear-btn"
                                onClick={() => dispatch(setSearchQuery(''))}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Grade Submission Modal */}
            <GradeSubmissionModal
                open={gradingModal.open}
                onClose={() => setGradingModal((prev) => ({ ...prev, open: false }))}
                assignment={gradingModal.assignment}
                submission={gradingModal.submission}
                onGraded={handleGradeSaved}
                themeColor={gradingModal.themeColor}
            />
        </div>
    );
}
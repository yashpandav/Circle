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
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import socket from "../../../../socket/socket";
import {
    Assignment as AssignmentIcon,
    RateReviewOutlined as RateReviewIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    WarningAmberRounded as WarningAmberIcon,
    AccessTime as AccessTimeIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    CalendarMonthOutlined as CalendarMonthIcon,
    ClassOutlined as ClassOutlinedIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    OpenInNew as OpenInNewIcon
} from "@mui/icons-material";
import { IconButton, Tooltip, Button, Select, MenuItem, FormControl } from "@mui/material";
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
    const reviewData = useSelector((state) => state.review?.reviewData) || EMPTY_ARRAY;
    const selectedClassId = useSelector((state) => state.review?.selectedClassId) || 'all';
    const activeTab = useSelector((state) => state.review?.activeTab) || 'To Review';
    const groupBy = useSelector((state) => state.review?.groupBy) || 'time';
    const searchQuery = useSelector((state) => state.review?.searchQuery) || '';
    const loading = useSelector((state) => state.review?.loading) || false;
    const isRefreshing = useSelector((state) => state.review?.isRefreshing) || false;

    const currClass = useSelector((state) => state.classes?.currClass);
    const joinedClassesAsTeacher = useSelector((state) => state.classes?.joinedClassesAsTeacher);
    const createdClasses = useSelector((state) => state.classes?.createdClasses);

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
                        name: rd.className || rd.classInfo?.name || "Untitled Circle",
                        subject: rd.classSubject || rd.classInfo?.subject || "",
                        classTheme: rd.classTheme || rd.classInfo?.classTheme || "#00a896"
                    });
                }
            });
        }

        return Array.from(map.values());
    }, [joinedClassesAsTeacher, createdClasses, reviewData]);

    // Calculate active theme color
    const activeThemeColor = useMemo(() => {
        if (selectedClassId && selectedClassId !== 'all') {
            const found = teachingClassesList.find((c) => c._id === selectedClassId);
            if (found?.classTheme && found.classTheme !== '#FFFFFF') {
                return found.classTheme;
            }
            const fromReview = reviewData.find((rd) => (rd.classId?._id || rd.classId) === selectedClassId);
            if (fromReview?.classTheme && fromReview.classTheme !== '#FFFFFF') {
                return fromReview.classTheme;
            }
        }
        if (currClass?.classTheme && currClass.classTheme !== '#FFFFFF') {
            return currClass.classTheme;
        }
        for (const rd of reviewData) {
            if (rd.classTheme && rd.classTheme !== '#FFFFFF') {
                return rd.classTheme;
            }
        }
        return '#00a896';
    }, [selectedClassId, teachingClassesList, currClass, reviewData]);

    // Collapsed sections tracking
    const [collapsedSections, setCollapsedSections] = useState({});

    const toggleSection = (sectionKey) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    // Fetch review data
    const fetchReviews = useCallback((isSilent = false) => {
        dispatch(getPendingReviews({ classId: selectedClassId, isSilent }));
    }, [dispatch, selectedClassId]);

    useEffect(() => {
        fetchReviews(false);
    }, [fetchReviews]);

    // Real-time synchronization via Socket.IO
    useEffect(() => {
        const handleLiveUpdate = () => {
            fetchReviews(true);
        };

        const events = [
            "assignment:new",
            "assignment:updated",
            "assignment:deleted",
            "assignment:submitted",
            "assignment:submission_updated",
            "assignment:submission_deleted",
            "review:updated"
        ];

        events.forEach((evt) => socket.on(evt, handleLiveUpdate));

        return () => {
            events.forEach((evt) => socket.off(evt, handleLiveUpdate));
        };
    }, [fetchReviews]);

    // Calculate dynamic badge counts
    const { toReviewCount, reviewedCount } = useMemo(() => {
        let toRev = 0;
        let rev = 0;

        if (Array.isArray(reviewData)) {
            reviewData.forEach((c) => {
                if (c.notReviedAss) toRev += c.notReviedAss.length;
                if (c.reviewdAss) rev += c.reviewdAss.length;
            });
        }

        return { toReviewCount: toRev, reviewedCount: rev };
    }, [reviewData]);

    // Filter assignments according to search, filterAssId, and active tab
    const filteredAssignments = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const items = [];

        if (!Array.isArray(reviewData)) return items;

        reviewData.forEach((classData) => {
            const list = activeTab === "To Review"
                ? (classData.notReviedAss || [])
                : (classData.reviewdAss || []);

            list.forEach((ass) => {
                if (!ass || typeof ass !== 'object') return;

                if (filterAssId && (ass._id?.toString() !== filterAssId && ass.id?.toString() !== filterAssId)) {
                    return;
                }

                const cName = classData.className || classData.classInfo?.name || "";
                const nameMatch = ass.name?.toLowerCase().includes(query);
                const descMatch = ass.description?.toLowerCase().includes(query);
                const catMatch = ass.category?.name?.toLowerCase().includes(query);
                const classNameMatch = cName.toLowerCase().includes(query);

                if (!query || nameMatch || descMatch || catMatch || classNameMatch) {
                    items.push({
                        ...ass,
                        classId: classData.classId?._id || classData.classId,
                        className: cName || "Circle",
                        classSubject: classData.classSubject || classData.classInfo?.subject || "",
                        classTheme: classData.classTheme || classData.classInfo?.classTheme || "#00a896"
                    });
                }
            });
        });

        return items;
    }, [reviewData, activeTab, searchQuery, filterAssId]);

    // Grouping computation
    const groupedData = useMemo(() => {
        const groups = {};

        if (groupBy === 'time') {
            const timeBucketsOrder = activeTab === "To Review"
                ? ["Past due / Needs grading", "Due this week", "Due next week", "Due later", "No due date"]
                : ["This week", "Last week", "Earlier", "No due date"];

            timeBucketsOrder.forEach((b) => {
                groups[b] = [];
            });

            filteredAssignments.forEach((ass) => {
                const bucket = getDateBucket(ass.dueDate, activeTab);
                if (!groups[bucket]) groups[bucket] = [];
                groups[bucket].push(ass);
            });

            // Clean up empty buckets
            const result = [];
            timeBucketsOrder.forEach((bucketName) => {
                if (groups[bucketName] && groups[bucketName].length > 0) {
                    result.push({
                        key: bucketName,
                        title: bucketName,
                        items: groups[bucketName]
                    });
                }
            });

            return result;
        } else {
            // Group by Circle
            filteredAssignments.forEach((ass) => {
                const circleKey = ass.classId?.toString() || 'unknown';
                const circleName = ass.className || 'Untitled Circle';
                const circleTheme = ass.classTheme || '#00a896';

                if (!groups[circleKey]) {
                    groups[circleKey] = {
                        key: circleKey,
                        title: circleName,
                        theme: circleTheme,
                        items: []
                    };
                }
                groups[circleKey].items.push(ass);
            });

            return Object.values(groups);
        }
    }, [filteredAssignments, groupBy, activeTab]);

    // Handlers for marking reviewed / pending
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

    return (
        <div
            className="review-page-root"
            style={{ "--class-theme": activeThemeColor }}
        >
            {/* 1. Header Toolbar */}
            <div className="review-header-container">
                <div className="review-header-left">
                    <div className="review-title-wrap">
                        <div
                            className="review-title-icon"
                            style={{ backgroundColor: `${activeThemeColor}18`, color: activeThemeColor }}
                        >
                            <RateReviewIcon fontSize="small" />
                        </div>
                        <div className="review-title-text">
                            <h1>To-review</h1>
                            <p>Manage and grade student submissions across your Circles</p>
                        </div>
                    </div>
                </div>

                <div className="review-header-actions">
                    {/* Circle Filter Dropdown */}
                    <div className="review-class-filter">
                        <ClassOutlinedIcon fontSize="small" className="filter-dropdown-icon" sx={{ position: 'absolute', left: 10, zIndex: 1, pointerEvents: 'none', color: '#64748b' }} />
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <Select
                                value={selectedClassId}
                                onChange={(e) => dispatch(setSelectedClassId(e.target.value))}
                                aria-label="Filter by Circle"
                                sx={{
                                    borderRadius: '8px',
                                    fontSize: '13.5px',
                                    fontWeight: 500,
                                    color: '#334155',
                                    backgroundColor: '#ffffff',
                                    '.MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#cbd5e1',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#94a3b8',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'var(--class-theme, #00a896)',
                                        borderWidth: '2px',
                                    },
                                    paddingLeft: '24px' // make space for the absolute icon
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            mt: 0.5,
                                            '& .MuiMenuItem-root': {
                                                fontSize: '13.5px',
                                                padding: '8px 16px',
                                            }
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="all">All Circles</MenuItem>
                                {teachingClassesList.map((cls) => (
                                    <MenuItem key={cls._id} value={cls._id}>
                                        {cls.name || "Untitled Circle"}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    {/* Group By Switcher */}
                    <div className="review-group-by">
                        <button
                            type="button"
                            className={`group-btn ${groupBy === 'time' ? 'active' : ''}`}
                            onClick={() => dispatch(setGroupBy('time'))}
                            title="Group by Due Date"
                        >
                            <CalendarMonthIcon fontSize="inherit" />
                            <span>Due Date</span>
                        </button>
                        <button
                            type="button"
                            className={`group-btn ${groupBy === 'circle' ? 'active' : ''}`}
                            onClick={() => dispatch(setGroupBy('circle'))}
                            title="Group by Circle"
                        >
                            <ClassOutlinedIcon fontSize="inherit" />
                            <span>Circle</span>
                        </button>
                    </div>

                    {/* Search Box */}
                    <div className="review-search-bar">
                        <SearchIcon fontSize="small" className="search-icon" />
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

                    {/* Refresh Button */}
                    <Tooltip title="Refresh review list">
                        <IconButton
                            onClick={() => fetchReviews(false)}
                            className={`review-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
                            size="small"
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            {/* 2. Navigation Tabs */}
            <div className="review-tabs-bar">
                <button
                    type="button"
                    className={`review-tab-item ${activeTab === 'To Review' ? 'active' : ''}`}
                    onClick={() => dispatch(setActiveTab('To Review'))}
                >
                    <span>To review</span>
                    <span className="tab-badge">{toReviewCount}</span>
                </button>
                <button
                    type="button"
                    className={`review-tab-item ${activeTab === 'Reviewed' ? 'active' : ''}`}
                    onClick={() => dispatch(setActiveTab('Reviewed'))}
                >
                    <span>Reviewed</span>
                    <span className="tab-badge">{reviewedCount}</span>
                </button>

                {filterAssId && (
                    <div className="active-filter-indicator">
                        <span>Filtered to single assignment</span>
                        <Button
                            size="small"
                            variant="text"
                            onClick={() => navigate('/workarea/review')}
                            sx={{ textTransform: 'none', fontSize: '12px', ml: 1 }}
                        >
                            Clear
                        </Button>
                    </div>
                )}
            </div>

            {/* 3. Main Review Content Area */}
            <div className="review-main-content">
                {loading && !isRefreshing ? (
                    <div className="review-loader-wrap">
                        <LoaderComponent />
                    </div>
                ) : groupedData.length === 0 ? (
                    /* Clean Empty State */
                    <div className="review-empty-state">
                        <div
                            className="empty-icon-circle"
                            style={{ backgroundColor: `${activeThemeColor}14`, color: activeThemeColor }}
                        >
                            {activeTab === "To Review" ? (
                                <CheckCircleIcon sx={{ fontSize: 48 }} />
                            ) : (
                                <RateReviewIcon sx={{ fontSize: 48 }} />
                            )}
                        </div>
                        <h3>
                            {searchQuery
                                ? "No assignments match your search"
                                : activeTab === "To Review"
                                    ? "All caught up! No work to review."
                                    : "No reviewed assignments yet."}
                        </h3>
                        <p>
                            {searchQuery
                                ? `Try refining your search terms or clearing the filter.`
                                : activeTab === "To Review"
                                    ? "When students submit assignments, they'll appear here for you to grade and review."
                                    : "Assignments you mark as reviewed will appear here for easy reference."}
                        </p>
                        {searchQuery && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => dispatch(setSearchQuery(''))}
                                sx={{ mt: 2, textTransform: 'none', borderRadius: '8px', color: activeThemeColor, borderColor: activeThemeColor }}
                            >
                                Clear search
                            </Button>
                        )}
                    </div>
                ) : (
                    /* Render Grouped Sections */
                    <div className="review-groups-container">
                        {groupedData.map((group) => {
                            const isCollapsed = Boolean(collapsedSections[group.key]);
                            const groupCount = group.items.length;

                            return (
                                <div key={group.key} className="review-group-section">
                                    {/* Section Header */}
                                    <div
                                        className="review-section-header"
                                        onClick={() => toggleSection(group.key)}
                                    >
                                        <div className="section-header-left">
                                            {groupBy === 'circle' && group.theme && (
                                                <span
                                                    className="circle-color-dot"
                                                    style={{ backgroundColor: group.theme }}
                                                />
                                            )}
                                            <h2 className="section-title">{group.title}</h2>
                                            <span className="section-count-badge">
                                                {groupCount} {groupCount === 1 ? 'assignment' : 'assignments'}
                                            </span>
                                        </div>
                                        <IconButton size="small" className="section-chevron">
                                            {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                                        </IconButton>
                                    </div>

                                    {/* Section Assignment Rows */}
                                    {!isCollapsed && (
                                        <div className="review-items-list">
                                            {group.items.map((ass, index) => {
                                                const isLast = index === group.items.length - 1;
                                                const dueInfo = formatDueDate(ass.dueDate);
                                                const submissionsCount = Array.isArray(ass.submission) ? ass.submission.length : 0;
                                                const pendingCount = Array.isArray(ass.pendingStudent) ? ass.pendingStudent.length : 0;
                                                const itemTheme = ass.classTheme || activeThemeColor;

                                                return (
                                                    <div
                                                        key={ass._id || index}
                                                        className={`review-row-item ${isLast ? 'is-last-row' : ''}`}
                                                        onClick={() => handleAssignmentClick(ass.classId, ass._id)}
                                                    >
                                                        {/* Left Icon & Meta */}
                                                        <div className="review-row-left">
                                                            <div
                                                                className="review-ass-icon"
                                                                style={{ backgroundColor: itemTheme }}
                                                            >
                                                                <AssignmentIcon fontSize="small" />
                                                            </div>
                                                            <div className="review-ass-meta">
                                                                <h4 className="review-ass-title">{ass.name}</h4>
                                                                <div className="review-ass-submeta">
                                                                    <span className="review-circle-name">{ass.className}</span>
                                                                    {ass.category?.name && (
                                                                        <>
                                                                            <span className="meta-dot">•</span>
                                                                            <span className="review-cat-name">{ass.category.name}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Center: Due Date Pill */}
                                                        <div className="review-row-center">
                                                            <div className={`due-status-pill ${dueInfo.isOverdue ? 'overdue' : dueInfo.isUrgent ? 'urgent' : ''}`}>
                                                                {dueInfo.isOverdue ? (
                                                                    <WarningAmberIcon fontSize="inherit" />
                                                                ) : (
                                                                    <AccessTimeIcon fontSize="inherit" />
                                                                )}
                                                                <span>{dueInfo.text}</span>
                                                            </div>
                                                        </div>

                                                        {/* Right: Submission Metrics & Action */}
                                                        <div className="review-row-right" onClick={(e) => e.stopPropagation()}>
                                                            <div className="review-metrics">
                                                                <div className="metric-pill turned-in" title={`${submissionsCount} students turned in`}>
                                                                    <span className="metric-num">{submissionsCount}</span>
                                                                    <span className="metric-lbl">Turned in</span>
                                                                </div>
                                                                <div className="metric-pill assigned" title={`${pendingCount} students assigned`}>
                                                                    <span className="metric-num">{pendingCount}</span>
                                                                    <span className="metric-lbl">Assigned</span>
                                                                </div>
                                                            </div>

                                                            <div className="review-action-wrap">
                                                                {activeTab === "To Review" ? (
                                                                    <button
                                                                        type="button"
                                                                        className="review-toggle-btn mark-reviewed"
                                                                        onClick={(e) => handleMarkReviewed(e, ass._id)}
                                                                        title="Mark as reviewed"
                                                                    >
                                                                        <CheckCircleOutlineIcon fontSize="small" />
                                                                        <span>Mark reviewed</span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        className="review-toggle-btn mark-pending"
                                                                        onClick={(e) => handleMarkPending(e, ass._id)}
                                                                        title="Move back to To-Review"
                                                                    >
                                                                        <RateReviewIcon fontSize="small" />
                                                                        <span>To review</span>
                                                                    </button>
                                                                )}

                                                                <Tooltip title="View submissions & details">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleAssignmentClick(ass.classId, ass._id)}
                                                                        className="review-view-details-btn"
                                                                    >
                                                                        <OpenInNewIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </div>
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
                )}
            </div>
        </div>
    );
}
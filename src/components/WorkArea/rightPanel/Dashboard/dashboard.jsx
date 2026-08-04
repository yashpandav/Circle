import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserDashboard } from "../../../../Api/apiCaller/userapicaller";
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import EditProfileModal from "./EditProfileModal";
import CreateClassDialog from "../../navbar/Helper/CreateClass/createClassDialog";
import JoinClassDialog from "../../navbar/Helper/JoinClass/joinClassDialog";
import {
    SchoolRounded as SchoolIcon,
    CastForEducationRounded as TeacherIcon,
    AssignmentRounded as AssignmentIcon,
    TaskAltRounded as TaskAltIcon,
    AccessTimeRounded as AccessTimeIcon,
    AddRounded as AddIcon,
    GroupAddRounded as GroupAddIcon,
    EditRounded as EditIcon,
    CalendarMonthRounded as CalendarIcon,
    ChevronRightRounded as ChevronRightIcon,
    SearchRounded as SearchIcon,
    ContentCopyRounded as CopyIcon,
    CheckRounded as CheckIcon,
    NotificationsActiveRounded as BellIcon,
    PersonRounded as PersonIcon,
    EmailRounded as EmailIcon,
    WcRounded as GenderIcon,
    CakeRounded as CakeIcon,
    InfoOutlined as InfoIcon,
    TrendingUpRounded as TrendingUpIcon,
    ArrowForwardRounded as ArrowForwardIcon,
    MenuBookRounded as BookIcon
} from "@mui/icons-material";
import { Avatar, Tooltip, Button } from "@mui/material";
import toast from "react-hot-toast";
import "./dashboard.css";

export default function Dashboard() {
    const navigate = useNavigate();
    const reduxUser = useSelector((state) => state?.auth?.user);

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); // "overview" | "circles" | "tasks" | "profile"
    const [circleFilter, setCircleFilter] = useState("all"); // "all" | "teaching" | "enrolled"
    const [circleSearch, setCircleSearch] = useState("");
    const [copiedCodeId, setCopiedCodeId] = useState(null);

    // Dialog state
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
    const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);

    // Fetch dashboard data
    const fetchDashboard = useCallback(async () => {
        try {
            const res = await getUserDashboard();
            if (res?.success) {
                setDashboardData(res.data);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Format human greeting
    const greetingText = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }, []);

    // Format friendly date
    const todayFormatted = useMemo(() => {
        return new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }, []);

    const user = dashboardData?.user || reduxUser;
    const teachingStats = dashboardData?.teachingStats || { totalClasses: 0, totalStudents: 0, totalAssignments: 0, totalSubmissionsReceived: 0, classes: [] };
    const studentStats = dashboardData?.studentStats || { totalClasses: 0, totalAssigned: 0, completedCount: 0, pendingCount: 0, missingCount: 0, completionRate: 100, classes: [] };
    const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];
    const recentActivity = dashboardData?.recentActivity || [];

    const isTeacher = teachingStats.totalClasses > 0;
    const isStudent = studentStats.totalClasses > 0;

    // Filter circles
    const allUniqueCircles = useMemo(() => {
        const teaching = teachingStats.classes || [];
        const enrolled = studentStats.classes || [];
        const map = new Map();
        teaching.forEach(c => map.set(c._id, { ...c, role: 'Teacher' }));
        enrolled.forEach(c => {
            if (!map.has(c._id)) {
                map.set(c._id, { ...c, role: 'Student' });
            }
        });
        return Array.from(map.values());
    }, [teachingStats.classes, studentStats.classes]);

    const filteredCircles = useMemo(() => {
        return allUniqueCircles.filter(c => {
            const matchesRole = circleFilter === "all" ||
                (circleFilter === "teaching" && c.role === "Teacher") ||
                (circleFilter === "enrolled" && c.role === "Student");
            const matchesQuery = !circleSearch.trim() ||
                (c.name && c.name.toLowerCase().includes(circleSearch.toLowerCase())) ||
                (c.subject && c.subject.toLowerCase().includes(circleSearch.toLowerCase()));
            return matchesRole && matchesQuery;
        });
    }, [allUniqueCircles, circleFilter, circleSearch]);

    const handleCopyCode = (e, code, classId) => {
        e.stopPropagation();
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopiedCodeId(classId);
        toast.success(`Class code copied: ${code}`);
        setTimeout(() => setCopiedCodeId(null), 2500);
    };

    const userInitials = `${(user?.firstName || 'U')[0]}${(user?.lastName || 'P')[0]}`.toUpperCase();

    if (loading) {
        return (
            <div className="dashboard-loader-wrap">
                <LoaderComponent />
            </div>
        );
    }

    return (
        <div className="circle-dashboard-container">
            {/* ── 1. Hero Header Banner ────────────────────────────── */}
            <div className="dashboard-hero-card">
                <div className="hero-left-content">
                    <div className="hero-avatar-wrap">
                        <Avatar
                            src={user?.image}
                            alt={user?.firstName}
                            sx={{
                                width: 72,
                                height: 72,
                                bgcolor: "#00a896",
                                fontSize: "1.75rem",
                                fontWeight: 700,
                                boxShadow: "0 6px 16px rgba(0, 168, 150, 0.3)",
                                border: "3px solid #ffffff"
                            }}
                        >
                            {userInitials}
                        </Avatar>
                        <button
                            type="button"
                            className="hero-avatar-edit-badge"
                            onClick={() => setIsEditProfileOpen(true)}
                            title="Edit Profile"
                        >
                            <EditIcon sx={{ fontSize: 14 }} />
                        </button>
                    </div>

                    <div className="hero-text-details">
                        <div className="hero-date-badge">
                            <CalendarIcon sx={{ fontSize: 14 }} />
                            <span>{todayFormatted}</span>
                        </div>
                        <h1 className="hero-title">
                            {greetingText}, {user?.firstName || "Scholar"}!
                        </h1>
                        <p className="hero-subtitle">
                            {user?.additionalDetails?.about
                                ? user.additionalDetails.about
                                : "Welcome to your Circle dashboard. Track your academic schedule, circles, and updates."}
                        </p>
                        <div className="hero-role-badges">
                            {isTeacher && <span className="hero-badge teacher"><TeacherIcon sx={{ fontSize: 15 }} /> Instructor</span>}
                            {isStudent && <span className="hero-badge student"><SchoolIcon sx={{ fontSize: 15 }} /> Student</span>}
                            <span className="hero-badge member">{user?.email}</span>
                        </div>
                    </div>
                </div>

                <div className="hero-right-actions">
                    <button
                        type="button"
                        className="hero-action-btn primary"
                        onClick={() => setIsCreateClassOpen(true)}
                    >
                        <AddIcon sx={{ fontSize: 18 }} />
                        <span>Create Circle</span>
                    </button>
                    <button
                        type="button"
                        className="hero-action-btn secondary"
                        onClick={() => setIsJoinClassOpen(true)}
                    >
                        <GroupAddIcon sx={{ fontSize: 18 }} />
                        <span>Join Circle</span>
                    </button>
                    <button
                        type="button"
                        className="hero-action-btn outline"
                        onClick={() => setIsEditProfileOpen(true)}
                    >
                        <EditIcon sx={{ fontSize: 17 }} />
                        <span>Edit Profile</span>
                    </button>
                </div>
            </div>

            {/* ── 2. Metric KPI Cards ──────────────────────────────── */}
            <div className="dashboard-stats-grid">
                <div className="dash-stat-card card-enrolled" onClick={() => { setActiveTab("circles"); setCircleFilter("enrolled"); }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Enrolled Circles</span>
                        <div className="stat-icon-wrap enrolled">
                            <SchoolIcon />
                        </div>
                    </div>
                    <div className="stat-card-value">{studentStats.totalClasses}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">
                            {studentStats.totalAssigned} total assigned tasks
                        </span>
                        <ChevronRightIcon className="stat-arrow" />
                    </div>
                </div>

                <div className="dash-stat-card card-teaching" onClick={() => { setActiveTab("circles"); setCircleFilter("teaching"); }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Teaching Circles</span>
                        <div className="stat-icon-wrap teaching">
                            <TeacherIcon />
                        </div>
                    </div>
                    <div className="stat-card-value">{teachingStats.totalClasses}</div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">
                            {teachingStats.totalStudents} students taught
                        </span>
                        <ChevronRightIcon className="stat-arrow" />
                    </div>
                </div>

                <div className="dash-stat-card card-pending" onClick={() => { setActiveTab("tasks"); }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Due / Pending Tasks</span>
                        <div className="stat-icon-wrap pending">
                            <AccessTimeIcon />
                        </div>
                    </div>
                    <div className="stat-card-value">
                        {studentStats.pendingCount}
                        {studentStats.missingCount > 0 && (
                            <span className="stat-missing-pill">+{studentStats.missingCount} overdue</span>
                        )}
                    </div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">
                            {studentStats.completedCount} assignments completed
                        </span>
                        <ChevronRightIcon className="stat-arrow" />
                    </div>
                </div>

                <div className="dash-stat-card card-completion" onClick={() => { setActiveTab("tasks"); }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Task Completion Rate</span>
                        <div className="stat-icon-wrap completion">
                            <TrendingUpIcon />
                        </div>
                    </div>
                    <div className="stat-card-value">{studentStats.completionRate}%</div>
                    <div className="stat-progress-bar-bg">
                        <div
                            className="stat-progress-bar-fill"
                            style={{ width: `${Math.min(100, Math.max(0, studentStats.completionRate))}%` }}
                        />
                    </div>
                    <div className="stat-card-footer">
                        <span className="stat-footer-text">Academic consistency</span>
                    </div>
                </div>
            </div>

            {/* ── 3. Tab Navigation ───────────────────────────────── */}
            <div className="dashboard-tabs-bar">
                <button
                    type="button"
                    className={`dash-tab-btn ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    <BookIcon sx={{ fontSize: 18 }} />
                    <span>Overview</span>
                </button>

                <button
                    type="button"
                    className={`dash-tab-btn ${activeTab === "circles" ? "active" : ""}`}
                    onClick={() => setActiveTab("circles")}
                >
                    <SchoolIcon sx={{ fontSize: 18 }} />
                    <span>My Circles</span>
                    <span className="dash-tab-count">{allUniqueCircles.length}</span>
                </button>

                <button
                    type="button"
                    className={`dash-tab-btn ${activeTab === "tasks" ? "active" : ""}`}
                    onClick={() => setActiveTab("tasks")}
                >
                    <TaskAltIcon sx={{ fontSize: 18 }} />
                    <span>Academic Tasks</span>
                    {studentStats.pendingCount > 0 && (
                        <span className="dash-tab-count alert">{studentStats.pendingCount}</span>
                    )}
                </button>

                <button
                    type="button"
                    className={`dash-tab-btn ${activeTab === "profile" ? "active" : ""}`}
                    onClick={() => setActiveTab("profile")}
                >
                    <PersonIcon sx={{ fontSize: 18 }} />
                    <span>Profile & Account</span>
                </button>
            </div>

            {/* ── 4. Tab Content Area ─────────────────────────────── */}
            <div className="dashboard-tab-content">
                {/* ── TAB 1: OVERVIEW ──────────────────────────────── */}
                {activeTab === "overview" && (
                    <div className="overview-layout-grid">
                        {/* Left Column: Upcoming Deadlines & Recent Circles */}
                        <div className="overview-main-col">
                            {/* Upcoming Deadlines Widget */}
                            <div className="dash-widget-card">
                                <div className="widget-header">
                                    <div className="widget-title-wrap">
                                        <div className="widget-icon red">
                                            <AccessTimeIcon sx={{ fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <h3 className="widget-title">Upcoming Deadlines</h3>
                                            <p className="widget-subtitle">Assignments scheduled for submission</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="widget-view-all-btn"
                                        onClick={() => setActiveTab("tasks")}
                                    >
                                        View All ({upcomingDeadlines.length})
                                    </button>
                                </div>

                                {upcomingDeadlines.length === 0 ? (
                                    <div className="widget-empty-state">
                                        <TaskAltIcon sx={{ fontSize: 44, color: "#10b981" }} />
                                        <h4>All caught up!</h4>
                                        <p>You have no pending assignments with upcoming due dates.</p>
                                    </div>
                                ) : (
                                    <div className="deadlines-list">
                                        {upcomingDeadlines.map((item) => {
                                            const dueDateObj = new Date(item.dueDate);
                                            const diffMs = dueDateObj.getTime() - new Date().getTime();
                                            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                            const isUrgent = diffDays <= 2;

                                            return (
                                                <div
                                                    key={item._id}
                                                    className={`deadline-row ${isUrgent ? "urgent" : ""}`}
                                                    onClick={() => navigate(`/workarea/circle/${item.classId}/assignment/${item._id}`)}
                                                >
                                                    <div
                                                        className="deadline-circle-indicator"
                                                        style={{ backgroundColor: item.classTheme || "#00a896" }}
                                                    />
                                                    <div className="deadline-details">
                                                        <span className="deadline-name">{item.name}</span>
                                                        <div className="deadline-meta">
                                                            <span className="deadline-class-name">{item.className}</span>
                                                            <span className="deadline-separator">•</span>
                                                            <span className="deadline-teacher">
                                                                {item.teacher?.firstName} {item.teacher?.lastName}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="deadline-right">
                                                        <span className={`deadline-tag ${isUrgent ? "tag-urgent" : "tag-normal"}`}>
                                                            {diffDays === 0
                                                                ? "Due Today"
                                                                : diffDays === 1
                                                                ? "Due Tomorrow"
                                                                : `Due in ${diffDays} days`}
                                                        </span>
                                                        <ArrowForwardIcon className="deadline-arrow" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Active Circles Quick Access */}
                            <div className="dash-widget-card">
                                <div className="widget-header">
                                    <div className="widget-title-wrap">
                                        <div className="widget-icon teal">
                                            <SchoolIcon sx={{ fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <h3 className="widget-title">Active Circles</h3>
                                            <p className="widget-subtitle">Jump straight into your classes and stream</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="widget-view-all-btn"
                                        onClick={() => setActiveTab("circles")}
                                    >
                                        View All ({allUniqueCircles.length})
                                    </button>
                                </div>

                                {allUniqueCircles.length === 0 ? (
                                    <div className="widget-empty-state">
                                        <SchoolIcon sx={{ fontSize: 44, color: "#94a3b8" }} />
                                        <h4>No circles yet</h4>
                                        <p>Create or join your first circle to start collaborating.</p>
                                        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => setIsCreateClassOpen(true)}
                                                sx={{ bgcolor: "#00a896", textTransform: "none" }}
                                            >
                                                Create Circle
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setIsJoinClassOpen(true)}
                                                sx={{ color: "#00a896", borderColor: "#00a896", textTransform: "none" }}
                                            >
                                                Join Circle
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overview-circles-grid">
                                        {allUniqueCircles.slice(0, 4).map((c) => (
                                            <div
                                                key={c._id}
                                                className="overview-circle-card"
                                                onClick={() => navigate(`/workarea/circle/${c._id}/stream`)}
                                            >
                                                <div
                                                    className="circle-card-banner"
                                                    style={{ backgroundColor: c.classTheme || "#00a896" }}
                                                >
                                                    <span className="circle-card-role-badge">{c.role}</span>
                                                    <h4 className="circle-card-title">{c.name}</h4>
                                                    <p className="circle-card-subject">{c.subject || "General Circle"}</p>
                                                </div>
                                                <div className="circle-card-body">
                                                    <div className="circle-card-instructor">
                                                        <Avatar
                                                            src={c.admin?.image}
                                                            sx={{ width: 26, height: 26, fontSize: "0.75rem", bgcolor: c.classTheme || "#00a896" }}
                                                        >
                                                            {(c.admin?.firstName || 'C')[0]}
                                                        </Avatar>
                                                        <span>{c.admin?.firstName ? `${c.admin.firstName} ${c.admin.lastName || ''}` : 'Instructor'}</span>
                                                    </div>
                                                    <div className="circle-card-actions">
                                                        <button
                                                            type="button"
                                                            className="circle-card-enter-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/workarea/circle/${c._id}/classwork`);
                                                            }}
                                                        >
                                                            Classwork
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Activity Stream & Profile Snippet */}
                        <div className="overview-side-col">
                            {/* User Profile Mini Widget */}
                            <div className="dash-widget-card profile-mini-widget">
                                <div className="mini-profile-banner" />
                                <div className="mini-profile-body">
                                    <Avatar
                                        src={user?.image}
                                        sx={{
                                            width: 58,
                                            height: 58,
                                            bgcolor: "#00a896",
                                            fontSize: "1.4rem",
                                            fontWeight: 700,
                                            border: "3px solid #ffffff",
                                            marginTop: "-29px",
                                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                                        }}
                                    >
                                        {userInitials}
                                    </Avatar>
                                    <h4 className="mini-profile-name">{user?.firstName} {user?.lastName}</h4>
                                    <span className="mini-profile-email">{user?.email}</span>
                                    <p className="mini-profile-about">
                                        {user?.additionalDetails?.about || "Learning, exploring, and building collaborative circles."}
                                    </p>

                                    <div className="mini-profile-stats-row">
                                        <div className="mini-stat">
                                            <span className="num">{allUniqueCircles.length}</span>
                                            <span className="lbl">Circles</span>
                                        </div>
                                        <div className="mini-stat">
                                            <span className="num">{studentStats.completedCount}</span>
                                            <span className="lbl">Completed</span>
                                        </div>
                                        <div className="mini-stat">
                                            <span className="num">{teachingStats.totalStudents}</span>
                                            <span className="lbl">Students</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="mini-profile-btn"
                                        onClick={() => setActiveTab("profile")}
                                    >
                                        Manage Account & Profile
                                    </button>
                                </div>
                            </div>

                            {/* Recent Stream Updates */}
                            <div className="dash-widget-card">
                                <div className="widget-header">
                                    <div className="widget-title-wrap">
                                        <div className="widget-icon purple">
                                            <BellIcon sx={{ fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <h3 className="widget-title">Recent Updates</h3>
                                            <p className="widget-subtitle">Latest class announcements</p>
                                        </div>
                                    </div>
                                </div>

                                {recentActivity.length === 0 ? (
                                    <div className="widget-empty-state small">
                                        <BellIcon sx={{ fontSize: 32, color: "#cbd5e1" }} />
                                        <p>No recent announcements posted.</p>
                                    </div>
                                ) : (
                                    <div className="activity-timeline">
                                        {recentActivity.map((act) => (
                                            <div key={act._id} className="timeline-item">
                                                <Avatar
                                                    src={act.author?.image}
                                                    sx={{ width: 32, height: 32, fontSize: "0.8rem", bgcolor: "#3b82f6" }}
                                                >
                                                    {(act.author?.firstName || 'A')[0]}
                                                </Avatar>
                                                <div className="timeline-content">
                                                    <span className="timeline-author">
                                                        {act.author?.firstName} {act.author?.lastName || ''}
                                                    </span>
                                                    <p className="timeline-title">{act.title || act.description}</p>
                                                    <span className="timeline-date">
                                                        {new Date(act.date).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: MY CIRCLES ────────────────────────────── */}
                {activeTab === "circles" && (
                    <div className="circles-tab-container">
                        {/* Filter & Search Toolbar */}
                        <div className="circles-toolbar">
                            <div className="circles-filter-pills">
                                <button
                                    type="button"
                                    className={`filter-pill ${circleFilter === "all" ? "active" : ""}`}
                                    onClick={() => setCircleFilter("all")}
                                >
                                    All Circles ({allUniqueCircles.length})
                                </button>
                                <button
                                    type="button"
                                    className={`filter-pill ${circleFilter === "teaching" ? "active" : ""}`}
                                    onClick={() => setCircleFilter("teaching")}
                                >
                                    Teaching ({teachingStats.totalClasses})
                                </button>
                                <button
                                    type="button"
                                    className={`filter-pill ${circleFilter === "enrolled" ? "active" : ""}`}
                                    onClick={() => setCircleFilter("enrolled")}
                                >
                                    Enrolled ({studentStats.totalClasses})
                                </button>
                            </div>

                            <div className="circles-search-box">
                                <SearchIcon className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search circles by name or subject..."
                                    value={circleSearch}
                                    onChange={(e) => setCircleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Circles Grid */}
                        {filteredCircles.length === 0 ? (
                            <div className="empty-circles-view">
                                <SchoolIcon sx={{ fontSize: 56, color: "#cbd5e1" }} />
                                <h3>No Circles Found</h3>
                                <p>There are no circles matching your filter or search query.</p>
                            </div>
                        ) : (
                            <div className="full-circles-grid">
                                {filteredCircles.map((circle) => {
                                    const isUserTeacher = circle.role === "Teacher";
                                    return (
                                        <div
                                            key={circle._id}
                                            className="full-circle-card"
                                            onClick={() => navigate(`/workarea/circle/${circle._id}/stream`)}
                                        >
                                            <div
                                                className="full-circle-header"
                                                style={{ backgroundColor: circle.classTheme || "#00a896" }}
                                            >
                                                <div className="full-circle-header-top">
                                                    <span className="full-circle-role-tag">{circle.role}</span>
                                                    {circle.entryCode && isUserTeacher && (
                                                        <Tooltip title="Copy Class Entry Code" arrow>
                                                            <button
                                                                type="button"
                                                                className="full-circle-code-btn"
                                                                onClick={(e) => handleCopyCode(e, circle.entryCode, circle._id)}
                                                            >
                                                                {copiedCodeId === circle._id ? (
                                                                    <CheckIcon sx={{ fontSize: 15 }} />
                                                                ) : (
                                                                    <CopyIcon sx={{ fontSize: 15 }} />
                                                                )}
                                                                <span>{circle.entryCode}</span>
                                                            </button>
                                                        </Tooltip>
                                                    )}
                                                </div>

                                                <h3 className="full-circle-name">{circle.name}</h3>
                                                <p className="full-circle-subject">{circle.subject || "General"}</p>
                                            </div>

                                            <div className="full-circle-body">
                                                <p className="full-circle-desc">
                                                    {circle.description || "No description provided."}
                                                </p>

                                                <div className="full-circle-footer">
                                                    <div className="full-circle-instructor">
                                                        <Avatar
                                                            src={circle.admin?.image}
                                                            sx={{ width: 28, height: 28, fontSize: "0.8rem", bgcolor: circle.classTheme || "#00a896" }}
                                                        >
                                                            {(circle.admin?.firstName || 'I')[0]}
                                                        </Avatar>
                                                        <span className="instructor-name">
                                                            {circle.admin?.firstName ? `${circle.admin.firstName} ${circle.admin.lastName || ''}` : 'Instructor'}
                                                        </span>
                                                    </div>

                                                    <div className="full-circle-nav-links">
                                                        <button
                                                            type="button"
                                                            className="full-circle-action-link"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/workarea/circle/${circle._id}/classwork`);
                                                            }}
                                                        >
                                                            Classwork
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="full-circle-action-link primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/workarea/circle/${circle._id}/stream`);
                                                            }}
                                                        >
                                                            Stream
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB 3: ACADEMIC TASKS ────────────────────────── */}
                {activeTab === "tasks" && (
                    <div className="tasks-tab-container">
                        {/* Progress Overview Card */}
                        <div className="task-overview-banner">
                            <div className="task-banner-left">
                                <div className="task-banner-metric">
                                    <span className="task-big-num">{studentStats.totalAssigned}</span>
                                    <span className="task-metric-lbl">Total Assigned</span>
                                </div>
                                <div className="task-banner-metric">
                                    <span className="task-big-num green">{studentStats.completedCount}</span>
                                    <span className="task-metric-lbl">Completed</span>
                                </div>
                                <div className="task-banner-metric">
                                    <span className="task-big-num amber">{studentStats.pendingCount}</span>
                                    <span className="task-metric-lbl">Pending Due</span>
                                </div>
                                <div className="task-banner-metric">
                                    <span className="task-big-num red">{studentStats.missingCount}</span>
                                    <span className="task-metric-lbl">Overdue / Missing</span>
                                </div>
                            </div>

                            <div className="task-banner-right">
                                <Button
                                    variant="contained"
                                    onClick={() => navigate("/workarea/todo")}
                                    sx={{
                                        bgcolor: "#00a896",
                                        "&:hover": { bgcolor: "#008f80" },
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: "8px",
                                        px: 3
                                    }}
                                >
                                    Open Full To-Do Hub
                                </Button>
                            </div>
                        </div>

                        {/* Upcoming Deadlines Full Section */}
                        <div className="dash-widget-card" style={{ marginTop: 24 }}>
                            <div className="widget-header">
                                <div className="widget-title-wrap">
                                    <div className="widget-icon amber">
                                        <AccessTimeIcon sx={{ fontSize: 20 }} />
                                    </div>
                                    <div>
                                        <h3 className="widget-title">Scheduled Submissions</h3>
                                        <p className="widget-subtitle">Assignments ordered by nearest due date</p>
                                    </div>
                                </div>
                            </div>

                            {upcomingDeadlines.length === 0 ? (
                                <div className="widget-empty-state">
                                    <TaskAltIcon sx={{ fontSize: 48, color: "#10b981" }} />
                                    <h4>No Pending Deadlines</h4>
                                    <p>You have submitted all active assignments.</p>
                                </div>
                            ) : (
                                <div className="deadlines-table-wrap">
                                    <table className="dash-tasks-table">
                                        <thead>
                                            <tr>
                                                <th>Assignment</th>
                                                <th>Circle</th>
                                                <th>Instructor</th>
                                                <th>Due Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {upcomingDeadlines.map((task) => (
                                                <tr
                                                    key={task._id}
                                                    onClick={() => navigate(`/workarea/circle/${task.classId}/assignment/${task._id}`)}
                                                >
                                                    <td className="task-name-cell">
                                                        <AssignmentIcon className="table-task-icon" />
                                                        <span>{task.name}</span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className="table-class-pill"
                                                            style={{ borderLeftColor: task.classTheme || "#00a896" }}
                                                        >
                                                            {task.className}
                                                        </span>
                                                    </td>
                                                    <td className="table-instructor-cell">
                                                        {task.teacher?.firstName} {task.teacher?.lastName}
                                                    </td>
                                                    <td className="table-due-cell">
                                                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="table-action-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/workarea/circle/${task.classId}/assignment/${task._id}`);
                                                            }}
                                                        >
                                                            View & Submit
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB 4: PROFILE & ACCOUNT ────────────────────── */}
                {activeTab === "profile" && (
                    <div className="profile-tab-container">
                        <div className="profile-details-card">
                            <div className="profile-card-header">
                                <div className="profile-card-avatar-wrap">
                                    <Avatar
                                        src={user?.image}
                                        sx={{
                                            width: 90,
                                            height: 90,
                                            bgcolor: "#00a896",
                                            fontSize: "2.2rem",
                                            fontWeight: 700,
                                            boxShadow: "0 8px 20px rgba(0,168,150,0.25)",
                                            border: "4px solid #ffffff"
                                        }}
                                    >
                                        {userInitials}
                                    </Avatar>
                                </div>
                                <div className="profile-card-titles">
                                    <h2>{user?.firstName} {user?.lastName}</h2>
                                    <span className="profile-card-email">{user?.email}</span>
                                    <div className="profile-pill-roles">
                                        {isTeacher && <span className="profile-pill teacher">Instructor</span>}
                                        {isStudent && <span className="profile-pill student">Student</span>}
                                        <span className="profile-pill active">Active Account</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="profile-edit-btn"
                                    onClick={() => setIsEditProfileOpen(true)}
                                >
                                    <EditIcon sx={{ fontSize: 18 }} />
                                    <span>Edit Profile Information</span>
                                </button>
                            </div>

                            <div className="profile-info-grid">
                                <div className="profile-info-item">
                                    <div className="info-icon-wrap"><PersonIcon /></div>
                                    <div className="info-text-wrap">
                                        <span className="info-label">Full Name</span>
                                        <span className="info-val">{user?.firstName} {user?.lastName}</span>
                                    </div>
                                </div>

                                <div className="profile-info-item">
                                    <div className="info-icon-wrap"><EmailIcon /></div>
                                    <div className="info-text-wrap">
                                        <span className="info-label">Email Address</span>
                                        <span className="info-val">{user?.email}</span>
                                    </div>
                                </div>

                                <div className="profile-info-item">
                                    <div className="info-icon-wrap"><GenderIcon /></div>
                                    <div className="info-text-wrap">
                                        <span className="info-label">Gender</span>
                                        <span className="info-val">{user?.additionalDetails?.gender || "Not specified"}</span>
                                    </div>
                                </div>

                                <div className="profile-info-item">
                                    <div className="info-icon-wrap"><CakeIcon /></div>
                                    <div className="info-text-wrap">
                                        <span className="info-label">Date of Birth</span>
                                        <span className="info-val">{user?.additionalDetails?.dob || "Not specified"}</span>
                                    </div>
                                </div>

                                <div className="profile-info-item full-width">
                                    <div className="info-icon-wrap"><InfoIcon /></div>
                                    <div className="info-text-wrap">
                                        <span className="info-label">About / Biography</span>
                                        <span className="info-val">
                                            {user?.additionalDetails?.about || "No biographical information provided yet."}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── 5. Dialogs ──────────────────────────────────────── */}
            {isEditProfileOpen && (
                <EditProfileModal
                    open={isEditProfileOpen}
                    onClose={() => setIsEditProfileOpen(false)}
                    user={user}
                    onProfileUpdated={fetchDashboard}
                />
            )}

            {isCreateClassOpen && (
                <CreateClassDialog setCreateDialog={setIsCreateClassOpen} />
            )}

            {isJoinClassOpen && (
                <JoinClassDialog setJoinDialog={setIsJoinClassOpen} />
            )}
        </div>
    );
}

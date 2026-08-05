import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserDashboard } from "../../../../Api/apiCaller/userapicaller";
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import EditProfileModal from "./EditProfileModal";
import CreateClassDialog from "../../navbar/Helper/CreateClass/createClassDialog";
import JoinClassDialog from "../../navbar/Helper/JoinClass/joinClassDialog";
import {
    Box,
    Paper,
    Card,
    CardContent,
    CardHeader,
    CardActionArea,
    Grid,
    Tabs,
    Tab,
    Badge,
    Chip,
    Avatar,
    Button,
    IconButton,
    Tooltip,
    Divider,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    TextField,
    InputAdornment
} from "@mui/material";
import {
    SchoolRounded as SchoolIcon,
    CastForEducationRounded as TeacherIcon,
    AssignmentRounded as AssignmentIcon,
    TaskAltRounded as TaskAltIcon,
    AccessTimeRounded as AccessTimeIcon,
    AddRounded as AddIcon,
    GroupAddRounded as GroupAddIcon,
    EditRounded as EditIcon,
    SearchRounded as SearchIcon,
    ContentCopyRounded as CopyIcon,
    CheckRounded as CheckIcon,
    CampaignRounded as CampaignIcon,
    PersonRounded as PersonIcon,
    EmailRounded as EmailIcon,
    WcRounded as GenderIcon,
    CakeRounded as CakeIcon,
    InfoOutlined as InfoIcon,
    TrendingUpRounded as TrendingUpIcon,
    ArrowForwardRounded as ArrowForwardIcon,
    FolderOpenOutlined as FolderOpenIcon,
    AssignmentOutlined as AssignmentOutlinedIcon
} from "@mui/icons-material";
import toast from "react-hot-toast";
import "./dashboard.css";

export default function Dashboard() {
    const navigate = useNavigate();
    const reduxUser = useSelector((state) => state?.auth?.user);

    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: Circles, 2: Tasks, 3: Profile

    // Sub-filters for "My Circles" tab
    const [circleFilter, setCircleFilter] = useState("all"); // "all" | "teaching" | "enrolled"
    const [circleSearch, setCircleSearch] = useState("");

    // Sub-filters for "Tasks" tab
    const [taskFilter, setTaskFilter] = useState("all"); // "all" | "dueSoon"

    // Dialog state handlers
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
    const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getUserDashboard();
            if (res && res.success) {
                setDashboardData(res.data);
            }
        } catch (err) {
            console.error("Failed to load user dashboard:", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Copy Circle Code helper
    const handleCopyCode = (e, code) => {
        e.stopPropagation();
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Circle code "${code}" copied to clipboard!`);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const user = dashboardData?.user || reduxUser;
    const teachingStats = dashboardData?.teachingStats || {
        totalClasses: 0,
        totalStudents: 0,
        totalAssignments: 0,
        totalSubmissionsReceived: 0,
        classes: []
    };
    const studentStats = dashboardData?.studentStats || {
        totalClasses: 0,
        totalAssigned: 0,
        completedCount: 0,
        pendingCount: 0,
        missingCount: 0,
        completionRate: 100,
        classes: []
    };
    const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];
    const recentActivity = dashboardData?.recentActivity || [];

    // Filtered Circles for "My Circles" tab
    const filteredCircles = useMemo(() => {
        let list = [];
        const teachingList = (teachingStats.classes || []).map((c) => ({ ...c, role: "teacher" }));
        const enrolledList = (studentStats.classes || []).map((c) => ({ ...c, role: "student" }));

        if (circleFilter === "teaching") {
            list = teachingList;
        } else if (circleFilter === "enrolled") {
            list = enrolledList;
        } else {
            // "all" - deduplicate by _id
            const map = new Map();
            teachingList.forEach((c) => map.set(c._id.toString(), c));
            enrolledList.forEach((c) => {
                if (!map.has(c._id.toString())) {
                    map.set(c._id.toString(), c);
                }
            });
            list = Array.from(map.values());
        }

        if (circleSearch.trim()) {
            const query = circleSearch.toLowerCase();
            list = list.filter(
                (c) =>
                    c.name?.toLowerCase().includes(query) ||
                    c.subject?.toLowerCase().includes(query) ||
                    c.description?.toLowerCase().includes(query)
            );
        }

        return list;
    }, [teachingStats.classes, studentStats.classes, circleFilter, circleSearch]);

    // Filtered Tasks for "Academic Tasks" tab
    const filteredTasks = useMemo(() => {
        if (taskFilter === "dueSoon") {
            const threeDaysFromNow = new Date();
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
            return upcomingDeadlines.filter((t) => new Date(t.dueDate) <= threeDaysFromNow);
        }
        return upcomingDeadlines;
    }, [upcomingDeadlines, taskFilter]);

    if (loading && !dashboardData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <LoaderComponent />
            </Box>
        );
    }

    const userInitials = `${(user?.firstName || "U")[0]}${(user?.lastName || "P")[0]}`.toUpperCase();
    const isTeacher = teachingStats.totalClasses > 0;
    const isStudent = studentStats.totalClasses > 0;

    return (
        <Box className="dashboard-container">
            {/* ── 1. USER HERO PROFILE BANNER ────────────────────── */}
            <Paper elevation={0} className="dash-hero-paper">
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={2.5}>
                        <Avatar
                            src={user?.image}
                            alt={user?.firstName}
                            sx={{
                                width: 68,
                                height: 68,
                                bgcolor: "#00a896",
                                fontSize: "1.6rem",
                                fontWeight: 700,
                                border: "3px solid #ffffff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
                            }}
                        >
                            {userInitials}
                        </Avatar>

                        <Box>
                            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                                <Typography variant="h5" sx={{ fontWeight: 600, color: "#1e293b", letterSpacing: "-0.2px" }}>
                                    Welcome back, {user?.firstName}
                                </Typography>
                                {isTeacher && (
                                    <Chip label="Instructor" size="small" sx={{ bgcolor: "#e0f2fe", color: "#0369a1", fontWeight: 600 }} />
                                )}
                                {isStudent && (
                                    <Chip label="Student" size="small" sx={{ bgcolor: "#e6f6f4", color: "#00a896", fontWeight: 600 }} />
                                )}
                            </Box>
                            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                                {user?.email} {user?.additionalDetails?.about ? `• "${user.additionalDetails.about}"` : ""}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditProfileOpen(true)}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderColor: "#dadce0",
                                color: "#475569",
                                "&:hover": { borderColor: "#00a896", color: "#00a896", bgcolor: "#f0faf9" }
                            }}
                        >
                            Edit Profile
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<GroupAddIcon />}
                            onClick={() => setIsJoinClassOpen(true)}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderColor: "#00a896",
                                color: "#00a896",
                                "&:hover": { borderColor: "#008f80", bgcolor: "#e6f6f4" }
                            }}
                        >
                            Join Circle
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setIsCreateClassOpen(true)}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                bgcolor: "#00a896",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#008f80", boxShadow: "none" }
                            }}
                        >
                            Create Circle
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* ── 2. METRIC SUMMARY CARDS ───────────────────────── */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {/* Enrolled Circles */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} className="dash-metric-card" onClick={() => setActiveTab(1)}>
                        <CardActionArea sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                                        Enrolled Circles
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b", mt: 0.5 }}>
                                        {studentStats.totalClasses}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: "#e6f6f4", color: "#00a896", width: 44, height: 44 }}>
                                    <SchoolIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#00a896", fontWeight: 500, mt: 1, display: "block" }}>
                                Active classrooms
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Teaching Circles */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} className="dash-metric-card" onClick={() => { setCircleFilter("teaching"); setActiveTab(1); }}>
                        <CardActionArea sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                                        Teaching Circles
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b", mt: 0.5 }}>
                                        {teachingStats.totalClasses}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: "#e0f2fe", color: "#0284c7", width: 44, height: 44 }}>
                                    <TeacherIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="caption" sx={{ color: "#0284c7", fontWeight: 500, mt: 1, display: "block" }}>
                                {teachingStats.totalStudents} enrolled students
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Pending Tasks */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} className="dash-metric-card" onClick={() => setActiveTab(2)}>
                        <CardActionArea sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                                        Pending Tasks
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b", mt: 0.5 }}>
                                        {studentStats.pendingCount}
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: "#fef3c7", color: "#d97706", width: 44, height: 44 }}>
                                    <AccessTimeIcon />
                                </Avatar>
                            </Box>
                            <Typography variant="caption" sx={{ color: studentStats.missingCount > 0 ? "#dc2626" : "#64748b", fontWeight: 500, mt: 1, display: "block" }}>
                                {studentStats.missingCount > 0 ? `${studentStats.missingCount} overdue tasks` : "Up to date"}
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Grid>

                {/* Completion Rate */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={0} className="dash-metric-card">
                        <Box sx={{ p: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                                        Task Completion
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b", mt: 0.5 }}>
                                        {studentStats.completionRate}%
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: "#ecfdf5", color: "#059669", width: 44, height: 44 }}>
                                    <TrendingUpIcon />
                                </Avatar>
                            </Box>
                            <Box sx={{ mt: 1.5 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={studentStats.completionRate}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: "#e2e8f0",
                                        "& .MuiLinearProgress-bar": { bgcolor: "#00a896", borderRadius: 3 }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* ── 3. MATERIAL UI NAVIGATION TABS ─────────────────── */}
            <Paper elevation={0} sx={{ mb: 3, borderBottom: "1px solid #e0e0e0", bgcolor: "#ffffff", borderRadius: "8px 8px 0 0" }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, val) => setActiveTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        px: 2,
                        "& .MuiTabs-indicator": { backgroundColor: "#00a896", height: 3, borderRadius: "3px 3px 0 0" },
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "#5f6368",
                            minHeight: 52,
                            "&.Mui-selected": { color: "#00a896" }
                        }
                    }}
                >
                    <Tab label="Overview" />
                    <Tab
                        label={
                            <Badge badgeContent={teachingStats.totalClasses + studentStats.totalClasses} color="default" sx={{ "& .MuiBadge-badge": { bgcolor: "#e2e8f0", color: "#475569", fontWeight: 600, right: -12 } }}>
                                My Circles
                            </Badge>
                        }
                    />
                    <Tab
                        label={
                            <Badge badgeContent={studentStats.pendingCount} color="error" sx={{ "& .MuiBadge-badge": { right: -12 } }}>
                                Academic Tasks
                            </Badge>
                        }
                    />
                    <Tab label="Profile & Account" />
                </Tabs>
            </Paper>

            {/* ── 4. TAB CONTENTS ────────────────────────────────── */}

            {/* TAB 0: OVERVIEW */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {/* Left Column (Upcoming Deadlines + Quick Circles) */}
                    <Grid item xs={12} lg={8}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            {/* Upcoming Submissions Card */}
                            <Card elevation={0} className="dash-section-card">
                                <CardHeader
                                    avatar={<AccessTimeIcon sx={{ color: "#d97706" }} />}
                                    title={<Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b" }}>Upcoming Submissions</Typography>}
                                    action={
                                        upcomingDeadlines.length > 0 && (
                                            <Button
                                                size="small"
                                                onClick={() => setActiveTab(2)}
                                                endIcon={<ArrowForwardIcon />}
                                                sx={{ textTransform: "none", color: "#00a896", fontWeight: 600 }}
                                            >
                                                View All
                                            </Button>
                                        )
                                    }
                                    sx={{ pb: 1, borderBottom: "1px solid #f1f5f9" }}
                                />
                                <CardContent sx={{ p: 0 }}>
                                    {upcomingDeadlines.length === 0 ? (
                                        <Box p={4} textAlign="center">
                                            <TaskAltIcon sx={{ fontSize: 44, color: "#059669", mb: 1 }} />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                                All assignments completed!
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                                                You have no pending deadlines across your enrolled circles.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        upcomingDeadlines.slice(0, 4).map((task, idx) => (
                                            <Box
                                                key={task._id || idx}
                                                className="dash-task-row"
                                                onClick={() => navigate(`/workarea/circle/${task.classId}/assignment/${task._id}`)}
                                            >
                                                <Box display="flex" alignItems="center" gap={2} flex={1} minWidth={0}>
                                                    <Avatar sx={{ width: 38, height: 38, bgcolor: task.classTheme || "#00a896", color: "#fff" }}>
                                                        <AssignmentIcon fontSize="small" />
                                                    </Avatar>
                                                    <Box minWidth={0}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                                            {task.name}
                                                        </Typography>
                                                        <Box display="flex" alignItems="center" gap={1} mt={0.3}>
                                                            <Chip
                                                                label={task.className}
                                                                size="small"
                                                                sx={{ height: 20, fontSize: "0.75rem", bgcolor: "#f1f5f9", color: "#475569" }}
                                                            />
                                                            {task.teacher && (
                                                                <Typography variant="caption" sx={{ color: "#64748b" }}>
                                                                    By {task.teacher.firstName} {task.teacher.lastName}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>

                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Typography variant="caption" sx={{ color: "#d97706", fontWeight: 600, whiteSpace: "nowrap" }}>
                                                        Due {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                    </Typography>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            textTransform: "none",
                                                            fontSize: "0.8rem",
                                                            borderColor: "#dadce0",
                                                            color: "#475569",
                                                            "&:hover": { borderColor: "#00a896", color: "#00a896" }
                                                        }}
                                                    >
                                                        Submit
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                </CardContent>
                            </Card>

                            {/* Active Circles Quick Grid */}
                            <Card elevation={0} className="dash-section-card">
                                <CardHeader
                                    avatar={<SchoolIcon sx={{ color: "#00a896" }} />}
                                    title={<Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b" }}>My Active Circles</Typography>}
                                    action={
                                        <Button
                                            size="small"
                                            onClick={() => setActiveTab(1)}
                                            endIcon={<ArrowForwardIcon />}
                                            sx={{ textTransform: "none", color: "#00a896", fontWeight: 600 }}
                                        >
                                            Manage All
                                        </Button>
                                    }
                                    sx={{ pb: 1, borderBottom: "1px solid #f1f5f9" }}
                                />
                                <CardContent sx={{ p: 2.5 }}>
                                    {filteredCircles.length === 0 ? (
                                        <Box p={3} textAlign="center">
                                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                                                You haven't joined or created any circles yet.
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<AddIcon />}
                                                onClick={() => setIsCreateClassOpen(true)}
                                                sx={{ mt: 1.5, textTransform: "none", bgcolor: "#00a896", "&:hover": { bgcolor: "#008f80" } }}
                                            >
                                                Create Your First Circle
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Grid container spacing={2}>
                                            {filteredCircles.slice(0, 4).map((item) => (
                                                <Grid item xs={12} sm={6} key={item._id}>
                                                    <Card
                                                        elevation={0}
                                                        className="dash-circle-preview-card"
                                                        onClick={() => navigate(`/workarea/circle/${item._id}`)}
                                                    >
                                                        {/* Header banner */}
                                                        <Box
                                                            className="dash-circle-header-banner"
                                                            sx={{
                                                                bgcolor: item.classTheme || "#00a896",
                                                                backgroundImage: item.thumbnail ? `url(${item.thumbnail})` : "none"
                                                            }}
                                                        >
                                                            <Typography variant="subtitle1" className="dash-circle-name">
                                                                {item.name}
                                                            </Typography>
                                                            <Typography variant="caption" className="dash-circle-subject">
                                                                {item.subject || item.description || "Circle Classroom"}
                                                            </Typography>
                                                        </Box>

                                                        {/* Card Body */}
                                                        <Box sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Avatar
                                                                    src={item.admin?.image}
                                                                    sx={{ width: 26, height: 26, bgcolor: "#00a896", fontSize: "0.75rem" }}
                                                                >
                                                                    {(item.admin?.firstName || "T")[0]}
                                                                </Avatar>
                                                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                                                                    {item.admin?.firstName} {item.admin?.lastName}
                                                                </Typography>
                                                            </Box>

                                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                                <IconButton
                                                                    size="small"
                                                                    title="Go to Classwork"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/workarea/circle/${item._id}/classwork`);
                                                                    }}
                                                                >
                                                                    <AssignmentOutlinedIcon fontSize="small" sx={{ color: "#64748b" }} />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    title="Open Folder"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/workarea/circle/${item._id}`);
                                                                    }}
                                                                >
                                                                    <FolderOpenIcon fontSize="small" sx={{ color: "#64748b" }} />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>

                    {/* Right Column (User Profile Card + Announcements Feed) */}
                    <Grid item xs={12} lg={4}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            {/* Profile Overview Card */}
                            <Card elevation={0} className="dash-section-card">
                                <CardHeader
                                    title={<Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b" }}>Account Summary</Typography>}
                                    sx={{ pb: 1, borderBottom: "1px solid #f1f5f9" }}
                                />
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" mb={2}>
                                        <Avatar
                                            src={user?.image}
                                            sx={{
                                                width: 72,
                                                height: 72,
                                                bgcolor: "#00a896",
                                                fontSize: "1.8rem",
                                                fontWeight: 700,
                                                border: "3px solid #e2e8f0",
                                                mb: 1.5
                                            }}
                                        >
                                            {userInitials}
                                        </Avatar>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                            {user?.firstName} {user?.lastName}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#64748b", mb: 1 }}>
                                            {user?.email}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 1.5 }} />

                                    <Box display="flex" flexDirection="column" gap={1.2}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" sx={{ color: "#64748b" }}>Role</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                                {isTeacher && isStudent ? "Instructor & Student" : isTeacher ? "Instructor" : "Student"}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" sx={{ color: "#64748b" }}>Gender</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                                {user?.additionalDetails?.gender || "Not specified"}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" sx={{ color: "#64748b" }}>Date of Birth</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                                {user?.additionalDetails?.dob || "Not specified"}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        onClick={() => setIsEditProfileOpen(true)}
                                        sx={{
                                            mt: 2.5,
                                            textTransform: "none",
                                            borderColor: "#dadce0",
                                            color: "#475569",
                                            fontWeight: 600,
                                            "&:hover": { borderColor: "#00a896", color: "#00a896" }
                                        }}
                                    >
                                        Edit Profile Info
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Announcements Feed */}
                            <Card elevation={0} className="dash-section-card">
                                <CardHeader
                                    avatar={<CampaignIcon sx={{ color: "#0284c7" }} />}
                                    title={<Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b" }}>Recent Stream Posts</Typography>}
                                    sx={{ pb: 1, borderBottom: "1px solid #f1f5f9" }}
                                />
                                <CardContent sx={{ p: 2 }}>
                                    {recentActivity.length === 0 ? (
                                        <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center", py: 2 }}>
                                            No recent stream updates.
                                        </Typography>
                                    ) : (
                                        <Box display="flex" flexDirection="column" gap={1.5}>
                                            {recentActivity.slice(0, 4).map((act, idx) => (
                                                <Box key={act._id || idx} sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                                                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                        <Avatar src={act.author?.image} sx={{ width: 22, height: 22, bgcolor: "#0284c7", fontSize: "0.7rem" }}>
                                                            {(act.author?.firstName || "U")[0]}
                                                        </Avatar>
                                                        <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                                            {act.author?.firstName} {act.author?.lastName}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: "#94a3b8", ml: "auto" }}>
                                                            {new Date(act.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.4 }}>
                                                        {act.description || act.title}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            )}

            {/* TAB 1: MY CIRCLES */}
            {activeTab === 1 && (
                <Box>
                    {/* Filter & Search Toolbar */}
                    <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: 2, bgcolor: "#ffffff" }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                            {/* Filter Chips */}
                            <Box display="flex" gap={1}>
                                <Chip
                                    label="All Circles"
                                    onClick={() => setCircleFilter("all")}
                                    color={circleFilter === "all" ? "primary" : "default"}
                                    variant={circleFilter === "all" ? "filled" : "outlined"}
                                    sx={{
                                        fontWeight: 600,
                                        bgcolor: circleFilter === "all" ? "#00a896" : "transparent",
                                        "&:hover": { bgcolor: circleFilter === "all" ? "#008f80" : "#f1f5f9" }
                                    }}
                                />
                                <Chip
                                    label={`Teaching (${teachingStats.totalClasses})`}
                                    onClick={() => setCircleFilter("teaching")}
                                    color={circleFilter === "teaching" ? "primary" : "default"}
                                    variant={circleFilter === "teaching" ? "filled" : "outlined"}
                                    sx={{
                                        fontWeight: 600,
                                        bgcolor: circleFilter === "teaching" ? "#00a896" : "transparent",
                                        "&:hover": { bgcolor: circleFilter === "teaching" ? "#008f80" : "#f1f5f9" }
                                    }}
                                />
                                <Chip
                                    label={`Enrolled (${studentStats.totalClasses})`}
                                    onClick={() => setCircleFilter("enrolled")}
                                    color={circleFilter === "enrolled" ? "primary" : "default"}
                                    variant={circleFilter === "enrolled" ? "filled" : "outlined"}
                                    sx={{
                                        fontWeight: 600,
                                        bgcolor: circleFilter === "enrolled" ? "#00a896" : "transparent",
                                        "&:hover": { bgcolor: circleFilter === "enrolled" ? "#008f80" : "#f1f5f9" }
                                    }}
                                />
                            </Box>

                            {/* Search Input */}
                            <TextField
                                placeholder="Search circles by name or subject..."
                                size="small"
                                value={circleSearch}
                                onChange={(e) => setCircleSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" sx={{ color: "#64748b" }} />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ minWidth: 280 }}
                            />
                        </Box>
                    </Paper>

                    {/* Circles Grid */}
                    {filteredCircles.length === 0 ? (
                        <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px solid #e0e0e0", borderRadius: 2 }}>
                            <SchoolIcon sx={{ fontSize: 52, color: "#94a3b8", mb: 1 }} />
                            <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
                                No circles found
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                                {circleSearch ? "Try adjusting your search criteria" : "Create or join a circle to get started"}
                            </Typography>
                            <Box display="flex" justifyContent="center" gap={1.5} mt={2.5}>
                                <Button
                                    variant="outlined"
                                    startIcon={<GroupAddIcon />}
                                    onClick={() => setIsJoinClassOpen(true)}
                                    sx={{ textTransform: "none", borderColor: "#00a896", color: "#00a896" }}
                                >
                                    Join Circle
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setIsCreateClassOpen(true)}
                                    sx={{ textTransform: "none", bgcolor: "#00a896", "&:hover": { bgcolor: "#008f80" } }}
                                >
                                    Create Circle
                                </Button>
                            </Box>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredCircles.map((c) => (
                                <Grid item xs={12} sm={6} md={4} key={c._id}>
                                    <Card
                                        elevation={0}
                                        className="dash-circle-card"
                                        onClick={() => navigate(`/workarea/circle/${c._id}`)}
                                    >
                                        {/* Banner Header */}
                                        <Box
                                            className="dash-circle-banner"
                                            sx={{
                                                bgcolor: c.classTheme || "#00a896",
                                                backgroundImage: c.thumbnail ? `url(${c.thumbnail})` : "none"
                                            }}
                                        >
                                            <Typography variant="h6" className="dash-circle-card-title">
                                                {c.name}
                                            </Typography>
                                            <Typography variant="body2" className="dash-circle-card-subtitle">
                                                {c.subject || c.description || "Classroom"}
                                            </Typography>
                                        </Box>

                                        {/* Body Content */}
                                        <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Avatar
                                                        src={c.admin?.image}
                                                        sx={{ width: 28, height: 28, bgcolor: "#00a896", fontSize: "0.8rem" }}
                                                    >
                                                        {(c.admin?.firstName || "T")[0]}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 500, color: "#1e293b" }}>
                                                        {c.admin?.firstName} {c.admin?.lastName}
                                                    </Typography>
                                                </Box>

                                                <Chip
                                                    label={c.role === "teacher" ? "Instructor" : "Enrolled"}
                                                    size="small"
                                                    sx={{
                                                        height: 22,
                                                        fontSize: "0.75rem",
                                                        fontWeight: 600,
                                                        bgcolor: c.role === "teacher" ? "#e0f2fe" : "#e6f6f4",
                                                        color: c.role === "teacher" ? "#0284c7" : "#00a896"
                                                    }}
                                                />
                                            </Box>

                                            {/* Entry code for teacher */}
                                            {c.entryCode && (
                                                <Box
                                                    display="flex"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    sx={{ bgcolor: "#f8fafc", p: "6px 12px", borderRadius: 1, border: "1px dashed #cbd5e1", my: 1 }}
                                                >
                                                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                                                        Class Code: <strong style={{ color: "#1e293b" }}>{c.entryCode}</strong>
                                                    </Typography>
                                                    <Tooltip title="Copy Class Code">
                                                        <IconButton size="small" onClick={(e) => handleCopyCode(e, c.entryCode)}>
                                                            {copiedCode === c.entryCode ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            )}
                                        </CardContent>

                                        <Divider />

                                        {/* Footer Shortcuts */}
                                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1 }}>
                                            <Button
                                                size="small"
                                                startIcon={<AssignmentOutlinedIcon />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/workarea/circle/${c._id}/classwork`);
                                                }}
                                                sx={{ textTransform: "none", color: "#475569", fontSize: "0.82rem" }}
                                            >
                                                Classwork
                                            </Button>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/workarea/circle/${c._id}`);
                                                }}
                                                title="Open Stream"
                                            >
                                                <FolderOpenIcon fontSize="small" sx={{ color: "#64748b" }} />
                                            </IconButton>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            )}

            {/* TAB 2: ACADEMIC TASKS */}
            {activeTab === 2 && (
                <Box>
                    {/* Task Sub-filter */}
                    <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: 2, bgcolor: "#ffffff" }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                            <Box display="flex" gap={1}>
                                <Chip
                                    label={`All Scheduled (${upcomingDeadlines.length})`}
                                    onClick={() => setTaskFilter("all")}
                                    color={taskFilter === "all" ? "primary" : "default"}
                                    variant={taskFilter === "all" ? "filled" : "outlined"}
                                    sx={{
                                        fontWeight: 600,
                                        bgcolor: taskFilter === "all" ? "#00a896" : "transparent",
                                        "&:hover": { bgcolor: taskFilter === "all" ? "#008f80" : "#f1f5f9" }
                                    }}
                                />
                                <Chip
                                    label="Due within 3 Days"
                                    onClick={() => setTaskFilter("dueSoon")}
                                    color={taskFilter === "dueSoon" ? "primary" : "default"}
                                    variant={taskFilter === "dueSoon" ? "filled" : "outlined"}
                                    sx={{
                                        fontWeight: 600,
                                        bgcolor: taskFilter === "dueSoon" ? "#00a896" : "transparent",
                                        "&:hover": { bgcolor: taskFilter === "dueSoon" ? "#008f80" : "#f1f5f9" }
                                    }}
                                />
                            </Box>

                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                                {studentStats.completedCount} completed of {studentStats.totalAssigned} total assignments
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Tasks Table */}
                    {filteredTasks.length === 0 ? (
                        <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px solid #e0e0e0", borderRadius: 2 }}>
                            <TaskAltIcon sx={{ fontSize: 52, color: "#059669", mb: 1 }} />
                            <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 600 }}>
                                No Pending Tasks
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
                                You are all caught up with your scheduled assignments.
                            </Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Assignment</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Circle</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Instructor</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Due Date</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, color: "#475569" }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTasks.map((task) => (
                                        <TableRow
                                            key={task._id}
                                            hover
                                            sx={{ cursor: "pointer", "&:last-child td, &:last-child th": { border: 0 } }}
                                            onClick={() => navigate(`/workarea/circle/${task.classId}/assignment/${task._id}`)}
                                        >
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: task.classTheme || "#00a896" }}>
                                                        <AssignmentIcon fontSize="small" />
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                                        {task.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={task.className}
                                                    size="small"
                                                    sx={{ bgcolor: "#f1f5f9", color: "#334155", fontWeight: 500 }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: "#64748b" }}>
                                                {task.teacher?.firstName} {task.teacher?.lastName}
                                            </TableCell>
                                            <TableCell sx={{ color: "#d97706", fontWeight: 600 }}>
                                                {new Date(task.dueDate).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/workarea/circle/${task.classId}/assignment/${task._id}`);
                                                    }}
                                                    sx={{
                                                        textTransform: "none",
                                                        bgcolor: "#00a896",
                                                        boxShadow: "none",
                                                        "&:hover": { bgcolor: "#008f80", boxShadow: "none" }
                                                    }}
                                                >
                                                    View & Submit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* TAB 3: PROFILE & ACCOUNT */}
            {activeTab === 3 && (
                <Paper elevation={0} sx={{ p: 4, border: "1px solid #e0e0e0", borderRadius: 2, bgcolor: "#ffffff", maxWidth: 800, mx: "auto" }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
                        <Box display="flex" alignItems="center" gap={2.5}>
                            <Avatar
                                src={user?.image}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: "#00a896",
                                    fontSize: "2rem",
                                    fontWeight: 700,
                                    border: "3px solid #e2e8f0"
                                }}
                            >
                                {userInitials}
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                    {user?.firstName} {user?.lastName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b" }}>
                                    {user?.email}
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditProfileOpen(true)}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                bgcolor: "#00a896",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "#008f80", boxShadow: "none" }
                            }}
                        >
                            Edit Profile
                        </Button>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                                    First Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: "#1e293b", mt: 0.5 }}>
                                    {user?.firstName || "-"}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                                    Last Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: "#1e293b", mt: 0.5 }}>
                                    {user?.lastName || "-"}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                                    Gender
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: "#1e293b", mt: 0.5 }}>
                                    {user?.additionalDetails?.gender || "Not specified"}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                                    Date of Birth
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: "#1e293b", mt: 0.5 }}>
                                    {user?.additionalDetails?.dob || "Not specified"}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                                    Biography
                                </Typography>
                                <Typography variant="body1" sx={{ color: "#334155", mt: 0.5, lineHeight: 1.6 }}>
                                    {user?.additionalDetails?.about || "No biography provided yet."}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* ── 5. MODALS & DIALOGS ────────────────────────────── */}
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
        </Box>
    );
}

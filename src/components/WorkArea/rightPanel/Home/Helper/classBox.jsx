import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import CloseIcon from "@mui/icons-material/Close";

import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Avatar,
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
} from "@mui/material";

import {
    getClass,
    updateClassDetails,
    deleteClassAction,
    leaveClassAction,
} from "../../../../../Api/apiCaller/classapicaller";
import { joinedClass } from "../../../../../Api/apiCaller/userapicaller";
import ConfirmationDialog from "../../../../Helper/ConfirmationDialog";
import ColorSelector from "../../../../Helper/colorSelector";
import "./classBox.css";

export const Classes = ({ item, index }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);
    const joinedClassesAsTeacher = useSelector((state) => state.classes.joinedClassesAsTeacher);

    // 3-dots Menu
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    // Modals
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openQuickAccessModal, setOpenQuickAccessModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Confirmation dialog
    const [confirmConfig, setConfirmConfig] = useState({
        open: false,
        title: "",
        content: "",
        action: null,
        confirmColor: "primary",
        confirmText: "Confirm",
    });

    // Edit form
    const [editData, setEditData] = useState({
        name: item?.name || "",
        description: item?.description || "",
        subject: item?.subject || "",
        classTheme: item?.classTheme || "#00a896",
    });

    const admin = item?.admin || {};
    const userId = (user?._id || user?.id)?.toString();
    const adminId = (admin?._id || admin?.id || admin)?.toString();
    const isAdmin = Boolean(userId && adminId && userId === adminId);
    const isTeacher =
        isAdmin ||
        (Array.isArray(joinedClassesAsTeacher) &&
            joinedClassesAsTeacher.some(
                (c) => (c?._id || c)?.toString() === item?._id?.toString()
            ));

    // Navigate into Circle
    const handleNavigateToCircle = () => {
        dispatch(getClass({ id: item._id, dispatch, navigate }));
    };

    // ── 3-dots menu ───────────────────────────────────────────────────────────
    const handleOpenMenu = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };
    const handleCloseMenu = (e) => {
        if (e) e.stopPropagation();
        setAnchorEl(null);
    };

    const handleCopyInviteLink = (e) => {
        e.stopPropagation();
        handleCloseMenu();
        navigator.clipboard.writeText(
            `${window.location.origin}/workarea/circle/${item._id}`
        );
        toast.success("Circle link copied to clipboard!");
    };

    const handleCopyClassCode = (e) => {
        if (e) e.stopPropagation();
        handleCloseMenu();
        if (item?.entryCode) {
            navigator.clipboard.writeText(item.entryCode);
            toast.success(`Class code copied: ${item.entryCode}`);
        } else {
            toast.error("No class code available");
        }
    };

    const handleOpenEditDialog = (e) => {
        e.stopPropagation();
        handleCloseMenu();
        setEditData({
            name: item?.name || "",
            description: item?.description || "",
            subject: item?.subject || "",
            classTheme: item?.classTheme || "#00a896",
        });
        setOpenEditModal(true);
    };

    const handleSaveEdit = async (e) => {
        if (e) e.preventDefault();
        if (!editData.name.trim()) {
            toast.error("Circle name is required");
            return;
        }
        setIsUpdating(true);
        try {
            await dispatch(
                updateClassDetails({ id: item._id, data: editData, dispatch })
            ).unwrap();
            await dispatch(joinedClass({ dispatch }));
            setOpenEditModal(false);
        } catch (err) {
            console.error("Failed to update circle:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteCircle = (e) => {
        e.stopPropagation();
        handleCloseMenu();
        setConfirmConfig({
            open: true,
            title: "Delete Circle",
            content: `Are you sure you want to permanently delete "${item.name}"? All posts, assignments, and materials will be deleted. This cannot be undone.`,
            confirmText: "Delete",
            confirmColor: "error",
            action: async () => {
                try {
                    await dispatch(
                        deleteClassAction({ id: item._id, navigate: null })
                    ).unwrap();
                    await dispatch(joinedClass({ dispatch }));
                } catch (err) {
                    console.error("Delete failed:", err);
                } finally {
                    setConfirmConfig((prev) => ({ ...prev, open: false }));
                }
            },
        });
    };

    const handleLeaveCircle = (e) => {
        e.stopPropagation();
        handleCloseMenu();
        setConfirmConfig({
            open: true,
            title: "Leave Circle",
            content: `Are you sure you want to leave "${item.name}"? You will lose access to all materials.`,
            confirmText: "Leave",
            confirmColor: "error",
            action: async () => {
                try {
                    await dispatch(
                        leaveClassAction({ classId: item._id, navigate: null })
                    ).unwrap();
                    await dispatch(joinedClass({ dispatch }));
                } catch (err) {
                    console.error("Leave failed:", err);
                } finally {
                    setConfirmConfig((prev) => ({ ...prev, open: false }));
                }
            },
        });
    };

    // ── Footer buttons ─────────────────────────────────────────────────────────
    // Icon 1 — go to Classwork (teacher) or Review (student)
    const handleOpenClasswork = (e) => {
        e.stopPropagation();
        navigate(`/workarea/circle/${item._id}/classwork`);
    };

    // Icon 2 — Quick Access modal
    const handleOpenQuickAccess = (e) => {
        e.stopPropagation();
        setOpenQuickAccessModal(true);
    };

    // ── Derived values ─────────────────────────────────────────────────────────
    const adminFirstName = admin?.firstName || "Teacher";
    const adminLastName = admin?.lastName || "";
    const adminFullName = `${adminFirstName} ${adminLastName}`.trim();
    const adminInitials = `${adminFirstName[0] || "T"}${adminLastName[0] || ""}`.toUpperCase();
    const themeColor = item?.classTheme || "#00a896";

    let displayName = item.name;
    if (displayName && displayName.length > 20) displayName = displayName.slice(0, 20);

    return (
        <>
            {/* ── Card ─────────────────────────────────────────────────────── */}
            <div
                className={`${displayName && displayName.length > 19 ? "overflowed-text" : ""} class`}
                key={index}
                onClick={handleNavigateToCircle}
            >
                {/* Header */}
                <div
                    className="header-class"
                    style={{
                        backgroundImage: item.thumbnail ? `url(${item.thumbnail})` : "none",
                        backgroundColor: item.thumbnail ? "transparent" : themeColor,
                    }}
                >
                    <div className="header-text-content">
                        <h2 className="class-title">{item.name}</h2>
                        <p className="class-description">{item.description}</p>
                    </div>

                    {/* 3-dots — same class as original, wrapped in stopPropagation div */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <MoreVertIcon
                            className="more-icon"
                            onClick={handleOpenMenu}
                        />
                        <Menu
                            anchorEl={anchorEl}
                            open={isMenuOpen}
                            onClose={handleCloseMenu}
                            onClick={(e) => e.stopPropagation()}
                            transformOrigin={{ horizontal: "right", vertical: "top" }}
                            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            PaperProps={{
                                elevation: 3,
                                sx: {
                                    borderRadius: "10px",
                                    minWidth: 200,
                                    py: 0.5,
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                                },
                            }}
                        >
                            {/* Copy Invite Link — all roles */}
                            <MenuItem
                                onClick={handleCopyInviteLink}
                                sx={{ py: 1, fontSize: "0.875rem" }}
                            >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <LinkOutlinedIcon fontSize="small" sx={{ color: "#5f6368" }} />
                                </ListItemIcon>
                                <ListItemText primary="Copy invite link" />
                            </MenuItem>

                            {/* Copy class code — admin only */}
                            {isAdmin && item?.entryCode && (
                                <MenuItem
                                    onClick={handleCopyClassCode}
                                    sx={{ py: 1, fontSize: "0.875rem" }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <ContentCopyOutlinedIcon
                                            fontSize="small"
                                            sx={{ color: "#5f6368" }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary="Copy class code" />
                                </MenuItem>
                            )}

                            {/* Edit circle — admin only */}
                            {isAdmin && (
                                <MenuItem
                                    onClick={handleOpenEditDialog}
                                    sx={{ py: 1, fontSize: "0.875rem" }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <EditOutlinedIcon
                                            fontSize="small"
                                            sx={{ color: "#5f6368" }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary="Edit circle" />
                                </MenuItem>
                            )}

                            {/* Delete — admin only */}
                            {isAdmin && (
                                <MenuItem
                                    onClick={handleDeleteCircle}
                                    sx={{
                                        py: 1,
                                        fontSize: "0.875rem",
                                        color: "#ef4444",
                                        "&:hover": { backgroundColor: "#fef2f2" },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <DeleteOutlineOutlinedIcon
                                            fontSize="small"
                                            sx={{ color: "#ef4444" }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary="Delete circle" />
                                </MenuItem>
                            )}

                            {/* Unenroll — students only */}
                            {!isAdmin && (
                                <MenuItem
                                    onClick={handleLeaveCircle}
                                    sx={{
                                        py: 1,
                                        fontSize: "0.875rem",
                                        color: "#ef4444",
                                        "&:hover": { backgroundColor: "#fef2f2" },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <ExitToAppOutlinedIcon
                                            fontSize="small"
                                            sx={{ color: "#ef4444" }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary="Unenroll" />
                                </MenuItem>
                            )}
                        </Menu>
                    </div>
                </div>

                {/* Admin info — original class names */}
                <div className="admin-info">
                    <span className="admin-name">{adminFullName}</span>
                    {admin.image ? (
                        <img src={admin.image} alt="admin-img" className="admin-img" />
                    ) : (
                        <div
                            className="admin-img"
                            style={{
                                backgroundColor: themeColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "1rem",
                            }}
                        >
                            {adminInitials}
                        </div>
                    )}
                </div>

                {/* Body — kept blank intentionally (like Google Classroom) */}
                <div className="content-class" />

                {/* Footer — original class names, icons with Tooltip + click */}
                <div className="footer-class">
                    <div className="icons" onClick={(e) => e.stopPropagation()}>
                        <Tooltip
                            title={isTeacher ? "Open Classwork & Assignments" : "View Your Submitted Work"}
                            arrow
                            placement="top"
                        >
                            <span style={{ display: "flex" }} onClick={handleOpenClasswork}>
                                {isTeacher ? <RateReviewOutlinedIcon /> : <TaskOutlinedIcon />}
                            </span>
                        </Tooltip>

                        <Tooltip title="Circle Info & Quick Access" arrow placement="top">
                            <span style={{ display: "flex" }} onClick={handleOpenQuickAccess}>
                                <InfoOutlinedIcon />
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* ── Quick Access Modal ─────────────────────────────────────────── */}
            <Dialog
                open={openQuickAccessModal}
                onClose={(e) => {
                    if (e) e.stopPropagation();
                    setOpenQuickAccessModal(false);
                }}
                onClick={(e) => e.stopPropagation()}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: "14px", overflow: "hidden" } }}
            >
                {/* Colored header */}
                <div
                    style={{
                        backgroundColor: themeColor,
                        padding: "20px 24px",
                        color: "#fff",
                        position: "relative",
                    }}
                >
                    <button
                        onClick={() => setOpenQuickAccessModal(false)}
                        style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "rgba(255,255,255,0.8)",
                            display: "flex",
                            padding: 4,
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>{item.name}</h3>
                    {item.subject && (
                        <p style={{ margin: "4px 0 0", fontSize: "0.85rem", opacity: 0.9 }}>
                            {item.subject}
                        </p>
                    )}
                </div>

                <DialogContent sx={{ p: 2.5 }}>
                    {/* Description */}
                    {item.description && (
                        <div style={{ marginBottom: "16px" }}>
                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "#64748b",
                                    textTransform: "uppercase",
                                }}
                            >
                                Description
                            </span>
                            <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "#334155" }}>
                                {item.description}
                            </p>
                        </div>
                    )}

                    {/* Admin info */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "16px",
                        }}
                    >
                        <Avatar
                            src={admin?.image || ""}
                            alt={adminFullName}
                            sx={{ width: 36, height: 36, bgcolor: themeColor, fontSize: "0.85rem" }}
                        >
                            {adminInitials}
                        </Avatar>
                        <div>
                            <span
                                style={{
                                    display: "block",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                }}
                            >
                                {adminFullName}
                            </span>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                Instructor / Admin
                            </span>
                        </div>
                    </div>

                    {/* Entry code — admin only */}
                    {isAdmin && item?.entryCode && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 14px",
                                backgroundColor: "#f8fafc",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                marginBottom: "16px",
                            }}
                        >
                            <div>
                                <span
                                    style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}
                                >
                                    Entry Code
                                </span>
                                <span
                                    style={{
                                        display: "block",
                                        fontSize: "1rem",
                                        fontWeight: 600,
                                        color: themeColor,
                                        letterSpacing: "1px",
                                    }}
                                >
                                    {item.entryCode}
                                </span>
                            </div>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ContentCopyOutlinedIcon fontSize="small" />}
                                onClick={handleCopyClassCode}
                                sx={{
                                    textTransform: "none",
                                    fontSize: "0.75rem",
                                    borderRadius: "6px",
                                }}
                            >
                                Copy
                            </Button>
                        </div>
                    )}

                    {/* Quick navigation */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span
                            style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#64748b",
                                textTransform: "uppercase",
                            }}
                        >
                            Quick Navigation
                        </span>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<ForumOutlinedIcon />}
                            onClick={() => {
                                setOpenQuickAccessModal(false);
                                navigate(`/workarea/circle/${item._id}/stream`);
                            }}
                            sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                color: "#334155",
                                borderColor: "#cbd5e1",
                            }}
                        >
                            Go to Stream
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<AssignmentOutlinedIcon />}
                            onClick={() => {
                                setOpenQuickAccessModal(false);
                                navigate(`/workarea/circle/${item._id}/classwork`);
                            }}
                            sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                color: "#334155",
                                borderColor: "#cbd5e1",
                            }}
                        >
                            Go to Classwork
                        </Button>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<PeopleOutlineIcon />}
                            onClick={() => {
                                setOpenQuickAccessModal(false);
                                navigate(`/workarea/circle/${item._id}/people`);
                            }}
                            sx={{
                                justifyContent: "flex-start",
                                textTransform: "none",
                                color: "#334155",
                                borderColor: "#cbd5e1",
                            }}
                        >
                            View Members & Teachers
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Edit Circle Modal ─────────────────────────────────────────── */}
            <Dialog
                open={openEditModal}
                onClose={(e) => {
                    if (e) e.stopPropagation();
                    setOpenEditModal(false);
                }}
                onClick={(e) => e.stopPropagation()}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: "12px" } }}
            >
                <div
                    style={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        color: "#1e293b",
                        padding: "20px 24px 8px 24px",
                    }}
                >
                    Edit Circle
                </div>
                <form onSubmit={handleSaveEdit}>
                    <DialogContent
                        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
                    >
                        <TextField
                            label="Circle Name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            fullWidth
                            required
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            label="Description"
                            value={editData.description}
                            onChange={(e) =>
                                setEditData({ ...editData, description: e.target.value })
                            }
                            fullWidth
                            multiline
                            rows={2}
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            label="Subject"
                            value={editData.subject}
                            onChange={(e) =>
                                setEditData({ ...editData, subject: e.target.value })
                            }
                            fullWidth
                            variant="outlined"
                            size="small"
                        />
                        <div>
                            <p
                                style={{
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: "#334155",
                                    marginBottom: "8px",
                                }}
                            >
                                Theme Color:
                            </p>
                            <ColorSelector
                                setselectedColor={(color) =>
                                    setEditData({ ...editData, classTheme: color })
                                }
                                selectedColor={editData.classTheme}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 1 }}>
                        <Button
                            onClick={() => setOpenEditModal(false)}
                            sx={{ textTransform: "none", color: "#64748b" }}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isUpdating}
                            sx={{
                                textTransform: "none",
                                backgroundColor: editData.classTheme || "#00a896",
                                "&:hover": {
                                    backgroundColor: editData.classTheme || "#00a896",
                                    opacity: 0.9,
                                },
                            }}
                        >
                            {isUpdating ? (
                                <CircularProgress size={20} sx={{ color: "#fff" }} />
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* ── Confirmation Dialog ────────────────────────────────────────── */}
            <ConfirmationDialog
                open={confirmConfig.open}
                title={confirmConfig.title}
                content={confirmConfig.content}
                confirmText={confirmConfig.confirmText}
                confirmColor={confirmConfig.confirmColor}
                onConfirm={confirmConfig.action}
                onCancel={() => setConfirmConfig((prev) => ({ ...prev, open: false }))}
            />
        </>
    );
};

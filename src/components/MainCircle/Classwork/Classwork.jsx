import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Assignment as AssignmentIcon,
    Add as AddIcon,
    FolderOutlined as FolderIcon,
    Search as SearchIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    DeleteOutline as DeleteIcon,
    OpenInNew as OpenInNewIcon,
    AccessTime as AccessTimeIcon,
    Close as CloseIcon,
    Topic as TopicIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    AssignmentIndOutlined as AssignmentIndIcon,
    InsertDriveFileOutlined as FileIcon
} from "@mui/icons-material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import {
    Button,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Tooltip,
    Tabs,
    Tab,
    Avatar
} from "@mui/material";
import { deleteAssignment } from "../../../Api/apiCaller/assignmentapicaller";
import { createCategory, deleteCategory } from "../../../Api/apiCaller/categoryapicaller";
import { updateCurrClass } from "../../../Slices/classSlice";
import socket from "../../../socket/socket";
import ConfirmationDialog from "../../Helper/ConfirmationDialog";
import CreateAssignmentModal from "./CreateAssignmentModal";
import EditAssignmentModal from "../MainCircleWorkingArea/EditAssignmentModal";
import TopicDropdown from "../../Helper/TopicDropdown";
import toast from "react-hot-toast";
import "./Classwork.css";

// Individual Assignment Item in Classwork
const ClassworkAssignmentItem = ({
    assignment,
    isTeacher,
    currUser,
    themeColor,
    currClassId,
    onEdit,
    onDelete
}) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const userId = (currUser?._id || currUser?.id)?.toString();
    const assTeacherId = (assignment.teacher?._id || assignment.teacher?.id || assignment.teacher)?.toString();
    const isAssignmentAuthor = Boolean(userId && assTeacherId && userId === assTeacherId);

    const submissions = assignment.submission || [];
    const pendingStudents = assignment.pendingStudent || [];

    const userSubmission = submissions.find(
        (s) => (s.student?._id === currUser?._id || s.student === currUser?._id || s === currUser?._id)
    );
    const isSubmitted = Boolean(userSubmission);
    const isPastDue = assignment.dueDate && new Date(assignment.dueDate).getTime() < Date.now();

    const handleMenuOpen = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = (e) => {
        if (e) e.stopPropagation();
        setAnchorEl(null);
    };

    const handleCopyLink = (e) => {
        e.stopPropagation();
        handleMenuClose();
        const url = `${window.location.origin}/workarea/circle/${currClassId}/assignment/${assignment._id}`;
        navigator.clipboard.writeText(url);
        toast.success("Assignment link copied to clipboard");
    };

    return (
        <div className={`classwork-assignment-card ${isExpanded ? "expanded" : ""}`}>
            {/* Header Row */}
            <div
                className="card-header-row"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="left-meta">
                    <div
                        className="assignment-type-icon"
                        style={{ backgroundColor: themeColor }}
                    >
                        <AssignmentIcon fontSize="small" />
                    </div>
                    <div className="title-and-date">
                        <h3 className="assignment-title">{assignment.name}</h3>
                        <span className="assignment-post-time">
                            Posted {new Date(assignment.uploadDate || Date.now()).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                        </span>
                    </div>
                </div>

                <div className="right-meta">
                    {/* Due Date */}
                    {assignment.dueDate ? (
                        <div className={`due-date-badge ${isPastDue ? "past-due" : ""}`}>
                            <AccessTimeIcon fontSize="inherit" />
                            <span>
                                Due {new Date(assignment.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                            </span>
                        </div>
                    ) : (
                        <span className="no-due-text">No due date</span>
                    )}

                    {/* Status for Students */}
                    {!isTeacher && (
                        <span className={`status-tag ${isSubmitted ? "done" : isPastDue ? "missing" : "assigned"}`}>
                            {isSubmitted ? "Turned in" : isPastDue ? "Missing" : "Assigned"}
                        </span>
                    )}

                    {/* Action Menu & Expand Chevron */}
                    <div className="item-actions">
                        {isTeacher && (
                            <IconButton
                                size="small"
                                onClick={handleMenuOpen}
                                className="item-more-btn"
                                title="Assignment options"
                            >
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        )}
                        <IconButton
                            size="small"
                            className="expand-chevron"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            title={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </div>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        onClick={(e) => e.stopPropagation()}
                        PaperProps={{
                            elevation: 3,
                            sx: { borderRadius: '10px', minWidth: '150px' }
                        }}
                    >
                        {isAssignmentAuthor && (
                            <MenuItem onClick={() => { handleMenuClose(); onEdit(assignment); }}>
                                <EditIcon fontSize="small" sx={{ mr: 1.2, color: '#64748b' }} /> Edit
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleCopyLink}>
                            <OpenInNewIcon fontSize="small" sx={{ mr: 1.2, color: '#64748b' }} /> Copy link
                        </MenuItem>
                        {isAssignmentAuthor && (
                            <MenuItem onClick={() => { handleMenuClose(); onDelete(assignment); }} sx={{ color: '#ef4444' }}>
                                <DeleteIcon fontSize="small" sx={{ mr: 1.2, color: '#ef4444' }} /> Delete
                            </MenuItem>
                        )}
                    </Menu>
                </div>
            </div>

            {/* Expandable Preview Body */}
            {isExpanded && (
                <div className="card-body-preview">
                    {/* Instructions Content */}
                    {assignment.description && (
                        <div
                            className="preview-instructions"
                            dangerouslySetInnerHTML={{ __html: assignment.description }}
                        />
                    )}

                    {/* Attachments Preview */}
                    {((assignment.files && assignment.files.length > 0) || assignment.file || (assignment.youtubeLinks && assignment.youtubeLinks.length > 0) || (assignment.links && assignment.links.length > 0)) && (
                        <div className="preview-attachment-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {assignment.files && assignment.files.length > 0 ? (
                                assignment.files.map((file, idx) => (
                                    <a
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="preview-file-chip"
                                        key={file.fileUrl || idx}
                                    >
                                        <PictureAsPdfRoundedIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                                        <span>{file.fileName ? (file.fileName.includes("|") ? file.fileName.split("|")[0] + "." + file.fileName.split(".").pop() : file.fileName) : "Attachment"}</span>
                                        <OpenInNewIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                                    </a>
                                ))
                            ) : assignment.file ? (
                                <a
                                    href={assignment.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="preview-file-chip"
                                >
                                    <PictureAsPdfRoundedIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                                    <span>Reference Material</span>
                                    <OpenInNewIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                                </a>
                            ) : null}

                            {assignment.youtubeLinks && assignment.youtubeLinks.map((yLink, idx) => (
                                <a
                                    href={yLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="preview-file-chip"
                                    key={idx}
                                >
                                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>▶</span>
                                    <span>YouTube Video</span>
                                    <OpenInNewIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                                </a>
                            ))}

                            {assignment.links && assignment.links.map((link, idx) => (
                                <a
                                    href={link.startsWith("http") ? link : `https://${link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="preview-file-chip"
                                    key={idx}
                                >
                                    <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '13px' }}>🔗</span>
                                    <span>{link}</span>
                                    <OpenInNewIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Bottom Action Footer */}
                    <div className="preview-footer-row">
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => navigate(`/workarea/circle/${currClassId}/assignment/${assignment._id}`)}
                            sx={{
                                color: themeColor,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '13px',
                                p: 0,
                                '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                            }}
                        >
                            {isAssignmentAuthor ? "View instructions & submissions →" : "View instructions →"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Classwork() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currClass = useSelector((state) => state.classes.currClass);
    const currUser = useSelector((state) => state.auth.user);

    const [selectedTopic, setSelectedTopic] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [createMenuAnchor, setCreateMenuAnchor] = useState(null);

    // Modals
    const [openCreateAssModal, setOpenCreateAssModal] = useState(false);
    const [openEditAssModal, setOpenEditAssModal] = useState(false);
    const [selectedAssignmentToEdit, setSelectedAssignmentToEdit] = useState(null);
    const [deleteAssConfirm, setDeleteAssConfirm] = useState({ open: false, assignment: null });

    const [openCreateTopicModal, setOpenCreateTopicModal] = useState(false);
    const [newTopicName, setNewTopicName] = useState("");
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    const [deleteTopicConfirm, setDeleteTopicConfirm] = useState({ open: false, topic: null });

    // Student Work Overview Modal
    const [openStudentWorkModal, setOpenStudentWorkModal] = useState(false);
    const [studentWorkTab, setStudentWorkTab] = useState(0); // 0: All, 1: Assigned, 2: Missing, 3: Done

    const themeColor = currClass?.classTheme || "#00a896";

    // Authorization
    const isTeacher = Boolean(
        (currClass?.admin && (currClass.admin._id === currUser?._id || currClass.admin === currUser?._id)) ||
        (currClass?.teacher && Array.isArray(currClass.teacher) && currClass.teacher.some(
            t => (t._id === currUser?._id || t === currUser?._id || t.id === currUser?._id)
        ))
    );

    // Live Socket Updates
    useEffect(() => {
        const handleAssignmentCreated = (newAss) => {
            if (newAss && currClass) {
                dispatch(updateCurrClass({
                    addedAssignment: [newAss, ...(currClass.addedAssignment || [])]
                }));
            }
        };

        const handleAssignmentUpdated = ({ data }) => {
            if (data && currClass?.addedAssignment) {
                const updated = currClass.addedAssignment.map(a => (a._id === data._id ? { ...a, ...data } : a));
                dispatch(updateCurrClass({ addedAssignment: updated }));
            }
        };

        const handleAssignmentDeleted = ({ assId }) => {
            if (assId && currClass?.addedAssignment) {
                const filtered = currClass.addedAssignment.filter(a => (a._id || a) !== assId);
                dispatch(updateCurrClass({ addedAssignment: filtered }));
            }
        };

        socket.on("assignment:new", handleAssignmentCreated);
        socket.on("assignment:updated", handleAssignmentUpdated);
        socket.on("assignment:deleted", handleAssignmentDeleted);

        return () => {
            socket.off("assignment:new", handleAssignmentCreated);
            socket.off("assignment:updated", handleAssignmentUpdated);
            socket.off("assignment:deleted", handleAssignmentDeleted);
        };
    }, [currClass, dispatch]);

    const assignments = useMemo(() => {
        return currClass?.addedAssignment || [];
    }, [currClass?.addedAssignment]);

    const categories = useMemo(() => {
        return currClass?.addedCategory || [];
    }, [currClass?.addedCategory]);

    // Grouping assignments by topic
    const { categorizedAssignments, uncategorizedAssignments, totalFilteredCount } = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const filtered = assignments.filter((ass) => {
            if (!ass || typeof ass !== "object") return false;
            const nameMatch = ass.name?.toLowerCase().includes(query);
            const descMatch = ass.description?.toLowerCase().includes(query);
            return nameMatch || descMatch;
        });

        const topicMap = {};
        categories.forEach((cat) => {
            topicMap[cat._id] = [];
        });

        const uncategorized = [];

        filtered.forEach((ass) => {
            const catId = ass.category?._id || ass.category;
            if (catId && topicMap[catId]) {
                topicMap[catId].push(ass);
            } else {
                uncategorized.push(ass);
            }
        });

        return {
            categorizedAssignments: topicMap,
            uncategorizedAssignments: uncategorized,
            totalFilteredCount: filtered.length
        };
    }, [assignments, categories, searchQuery]);

    // Delete Assignment Handler
    const handleDeleteAssignmentConfirm = async () => {
        const ass = deleteAssConfirm.assignment;
        if (!ass) return;

        try {
            const res = await dispatch(deleteAssignment(ass._id));
            if (deleteAssignment.fulfilled.match(res)) {
                if (currClass?.addedAssignment) {
                    const updated = currClass.addedAssignment.filter((a) => (a._id || a) !== ass._id);
                    dispatch(updateCurrClass({ addedAssignment: updated }));
                }
            }
        } catch (err) {
            console.error("Error deleting assignment", err);
        } finally {
            setDeleteAssConfirm({ open: false, assignment: null });
        }
    };

    // Topic Management Handlers
    const handleCreateTopic = async () => {
        const name = newTopicName.trim();
        if (!name) {
            toast.error("Please enter a topic name");
            return;
        }

        setIsCreatingTopic(true);
        try {
            const res = await dispatch(createCategory({ name, classId: currClass._id })).unwrap();
            if (res && res.data) {
                dispatch(updateCurrClass({
                    addedCategory: [...(currClass.addedCategory || []), res.data]
                }));
                setNewTopicName("");
                setOpenCreateTopicModal(false);
                toast.success(`Topic "${name}" created`);
            }
        } catch (err) {
            console.error("Error creating topic", err);
        } finally {
            setIsCreatingTopic(false);
        }
    };

    const handleDeleteTopicConfirm = async () => {
        const topic = deleteTopicConfirm.topic;
        if (!topic) return;

        try {
            const res = await dispatch(deleteCategory({ categoryId: topic._id, classId: currClass._id })).unwrap();
            if (res) {
                dispatch(updateCurrClass({
                    addedCategory: categories.filter((c) => c._id !== topic._id)
                }));
                if (selectedTopic === topic._id) {
                    setSelectedTopic("ALL");
                }
                toast.success("Topic deleted");
            }
        } catch (err) {
            console.error("Error deleting topic", err);
        } finally {
            setDeleteTopicConfirm({ open: false, topic: null });
        }
    };

    // Student Work Metrics in this class
    const studentWorkStats = useMemo(() => {
        let assignedCount = 0;
        let missingCount = 0;
        let doneCount = 0;

        const allItems = [];

        assignments.forEach((ass) => {
            if (!ass || typeof ass !== "object") return;
            const submissions = ass.submission || [];
            const isSub = submissions.some(
                (s) => s.student?._id === currUser?._id || s.student === currUser?._id || s === currUser?._id
            );
            const isPast = ass.dueDate && new Date(ass.dueDate).getTime() < Date.now();

            let status = "assigned";
            if (isSub) {
                status = "done";
                doneCount++;
            } else if (isPast) {
                status = "missing";
                missingCount++;
            } else {
                status = "assigned";
                assignedCount++;
            }

            allItems.push({
                assignment: ass,
                status,
                dueDate: ass.dueDate
            });
        });

        return {
            total: assignments.length,
            assignedCount,
            missingCount,
            doneCount,
            allItems
        };
    }, [assignments, currUser]);

    // Active filtered topic data
    const activeSelectedCategory = categories.find((c) => c._id === selectedTopic);

    return (
        <div className="classwork-page-container">
            <style>{`
                .classwork-page-container {
                    --class-theme: ${themeColor || '#00a896'};
                }
            `}</style>
            {/* Top Clean Action & Filter Toolbar */}
            <div className="classwork-toolbar">
                <div className="classwork-toolbar-left">
                    {/* Teacher: + Create Menu Button and Review Work Button */}
                    {isTeacher ? (
                        <div className="teacher-toolbar-actions">
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                endIcon={<ExpandMoreIcon fontSize="small" />}
                                onClick={(e) => setCreateMenuAnchor(e.currentTarget)}
                                className="classwork-create-btn"
                                style={{ backgroundColor: themeColor }}
                            >
                                Create
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<AssignmentIndIcon />}
                                onClick={() => navigate('/workarea/review')}
                                className="classwork-review-btn"
                                sx={{
                                    borderColor: '#cbd5e1',
                                    color: '#334155',
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    height: '44px',
                                    px: 2,
                                    '&:hover': { borderColor: themeColor, color: themeColor, backgroundColor: '#f8fafc' }
                                }}
                            >
                                Review work
                            </Button>
                            <Menu
                                anchorEl={createMenuAnchor}
                                open={Boolean(createMenuAnchor)}
                                onClose={() => setCreateMenuAnchor(null)}
                                PaperProps={{
                                    elevation: 4,
                                    sx: { borderRadius: '12px', minWidth: '180px', py: 0.5 }
                                }}
                            >
                                <MenuItem onClick={() => { setCreateMenuAnchor(null); setOpenCreateAssModal(true); }}>
                                    <AssignmentIcon fontSize="small" sx={{ mr: 1.5, color: themeColor }} /> Assignment
                                </MenuItem>
                                <MenuItem onClick={() => { setCreateMenuAnchor(null); setOpenCreateTopicModal(true); }}>
                                    <TopicIcon fontSize="small" sx={{ mr: 1.5, color: '#64748b' }} /> Topic
                                </MenuItem>
                            </Menu>
                        </div>
                    ) : (
                        /* Student: View Your Work Button */
                        <Button
                            variant="outlined"
                            startIcon={<AssignmentIndIcon />}
                            onClick={() => setOpenStudentWorkModal(true)}
                            className="classwork-student-work-btn"
                            sx={{
                                borderColor: '#cbd5e1',
                                color: '#334155',
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                height: '44px',
                                px: 2,
                                '&:hover': { borderColor: themeColor, color: themeColor, backgroundColor: '#f8fafc' }
                            }}
                        >
                            View your work
                        </Button>
                    )}
                </div>

                <div className="classwork-toolbar-right">
                    {/* Topic Filter Dropdown */}
                    <TopicDropdown
                        selectedTopic={selectedTopic}
                        onSelectTopic={(topicId) => setSelectedTopic(topicId || "ALL")}
                        defaultLabel="All topics"
                        emptyValue="ALL"
                        allowCreate={isTeacher}
                        allowDelete={isTeacher}
                    />

                    {/* Search Input Box */}
                    <div className="classwork-search-box">
                        <SearchIcon fontSize="small" sx={{ color: 'inherit' }} />
                        <input
                            type="text"
                            placeholder="Search assignments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <IconButton size="small" onClick={() => setSearchQuery("")}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Stream */}
            <div className="classwork-content-area">
                {/* 1. Global Empty State when circle has 0 assignments */}
                {assignments.length === 0 ? (
                    <div className="classwork-empty-state">
                        <div className="empty-icon-circle" style={{ backgroundColor: `${themeColor}12` }}>
                            <AssignmentIcon sx={{ color: themeColor, fontSize: 44 }} />
                        </div>
                        <h3>{isTeacher ? "This is where you'll assign work" : "No assignments yet"}</h3>
                        <p>
                            {isTeacher
                                ? "Create assignments and questions, organize work into topics, and order work the way you want students to see it."
                                : "Your instructor hasn't posted any assignments in this circle yet. Check back soon!"}
                        </p>
                        {isTeacher && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenCreateAssModal(true)}
                                style={{
                                    backgroundColor: themeColor,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    height: '44px',
                                    padding: '0 20px',
                                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
                                }}
                            >
                                Create Assignment
                            </Button>
                        )}
                    </div>
                ) : searchQuery && totalFilteredCount === 0 ? (
                    /* 2. Search Query Yielded 0 Matches */
                    <div className="classwork-search-empty">
                        <p>No assignments found matching "<strong>{searchQuery}</strong>"</p>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => setSearchQuery("")}
                            sx={{ color: themeColor, textTransform: 'none', fontWeight: 600 }}
                        >
                            Clear search
                        </Button>
                    </div>
                ) : selectedTopic === "ALL" ? (
                    /* 3. "All Topics" View: Only show topic sections that actually have assignments */
                    <div className="classwork-topics-list">
                        {/* Categorized topics that have assignments */}
                        {categories
                            .filter((cat) => (categorizedAssignments[cat._id]?.length || 0) > 0)
                            .map((cat) => {
                                const topicAssignments = categorizedAssignments[cat._id] || [];
                                return (
                                    <div key={cat._id} className="topic-group-section">
                                        <div className="topic-group-header">
                                            <div className="topic-header-left">
                                                <h2 className="topic-title">{cat.name}</h2>
                                                <span className="topic-count-tag">
                                                    {topicAssignments.length} {topicAssignments.length === 1 ? "assignment" : "assignments"}
                                                </span>
                                            </div>

                                            {isTeacher && (
                                                <div className="topic-header-actions">
                                                    <Tooltip title="Delete topic" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setDeleteTopicConfirm({ open: true, topic: cat })}
                                                            className="topic-del-btn"
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>

                                        <div className="topic-assignments-stack">
                                            {topicAssignments.map((ass) => (
                                                <ClassworkAssignmentItem
                                                    key={ass._id}
                                                    assignment={ass}
                                                    isTeacher={isTeacher}
                                                    currUser={currUser}
                                                    themeColor={themeColor}
                                                    currClassId={currClass._id}
                                                    onEdit={(item) => {
                                                        setSelectedAssignmentToEdit(item);
                                                        setOpenEditAssModal(true);
                                                    }}
                                                    onDelete={(item) => setDeleteAssConfirm({ open: true, assignment: item })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                        {/* Uncategorized assignments under General Classwork */}
                        {uncategorizedAssignments.length > 0 && (
                            <div className="topic-group-section">
                                <div className="topic-group-header">
                                    <div className="topic-header-left">
                                        <h2 className="topic-title">General Classwork</h2>
                                        <span className="topic-count-tag">
                                            {uncategorizedAssignments.length} {uncategorizedAssignments.length === 1 ? "assignment" : "assignments"}
                                        </span>
                                    </div>
                                </div>

                                <div className="topic-assignments-stack">
                                    {uncategorizedAssignments.map((ass) => (
                                        <ClassworkAssignmentItem
                                            key={ass._id}
                                            assignment={ass}
                                            isTeacher={isTeacher}
                                            currUser={currUser}
                                            themeColor={themeColor}
                                            currClassId={currClass._id}
                                            onEdit={(item) => {
                                                setSelectedAssignmentToEdit(item);
                                                setOpenEditAssModal(true);
                                            }}
                                            onDelete={(item) => setDeleteAssConfirm({ open: true, assignment: item })}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 4. Single Topic Selected View */
                    <div className="classwork-topics-list">
                        <div className="topic-group-section">
                            <div className="topic-group-header">
                                <div className="topic-header-left">
                                    <h2 className="topic-title">{activeSelectedCategory ? activeSelectedCategory.name : "Topic"}</h2>
                                    <span className="topic-count-tag">
                                        {(categorizedAssignments[selectedTopic]?.length || 0)} assignments
                                    </span>
                                </div>

                                {isTeacher && activeSelectedCategory && (
                                    <div className="topic-header-actions">
                                        <Tooltip title="Delete topic" arrow>
                                            <IconButton
                                                size="small"
                                                onClick={() => setDeleteTopicConfirm({ open: true, topic: activeSelectedCategory })}
                                                className="topic-del-btn"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                )}
                            </div>

                            <div className="topic-assignments-stack">
                                {(categorizedAssignments[selectedTopic]?.length || 0) > 0 ? (
                                    categorizedAssignments[selectedTopic].map((ass) => (
                                        <ClassworkAssignmentItem
                                            key={ass._id}
                                            assignment={ass}
                                            isTeacher={isTeacher}
                                            currUser={currUser}
                                            themeColor={themeColor}
                                            currClassId={currClass._id}
                                            onEdit={(item) => {
                                                setSelectedAssignmentToEdit(item);
                                                setOpenEditAssModal(true);
                                            }}
                                            onDelete={(item) => setDeleteAssConfirm({ open: true, assignment: item })}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-topic-inline">
                                        <p>No assignments in this topic yet.</p>
                                        {isTeacher && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<AddIcon />}
                                                onClick={() => setOpenCreateAssModal(true)}
                                                sx={{
                                                    borderColor: themeColor,
                                                    color: themeColor,
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    borderRadius: '10px',
                                                    height: '38px',
                                                    px: 2
                                                }}
                                            >
                                                Add assignment to this topic
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Assignment Modal */}
            <CreateAssignmentModal
                open={openCreateAssModal}
                onClose={() => setOpenCreateAssModal(false)}
                defaultCategoryId={selectedTopic !== "ALL" ? selectedTopic : ""}
            />

            {/* Edit Assignment Modal */}
            {selectedAssignmentToEdit && (
                <EditAssignmentModal
                    open={openEditAssModal}
                    onClose={() => {
                        setOpenEditAssModal(false);
                        setSelectedAssignmentToEdit(null);
                    }}
                    assignment={selectedAssignmentToEdit}
                    onAssignmentUpdated={(updated) => {
                        if (currClass?.addedAssignment) {
                            const newAss = currClass.addedAssignment.map(a => a._id === updated._id ? { ...a, ...updated } : a);
                            dispatch(updateCurrClass({ addedAssignment: newAss }));
                        }
                    }}
                />
            )}

            {/* Create Topic Dialog */}
            <Dialog
                open={openCreateTopicModal}
                onClose={() => !isCreatingTopic && setOpenCreateTopicModal(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a' }}>
                    Add Topic
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Topic Name"
                        placeholder="e.g. Chapter 1: Introduction"
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateTopic();
                            }
                        }}
                        disabled={isCreatingTopic}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setOpenCreateTopicModal(false)}
                        disabled={isCreatingTopic}
                        sx={{ textTransform: 'none', color: '#64748b' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateTopic}
                        disabled={isCreatingTopic || !newTopicName.trim()}
                        style={{ backgroundColor: themeColor, textTransform: 'none', borderRadius: '8px' }}
                    >
                        {isCreatingTopic ? <CircularProgress size={18} color="inherit" /> : "Add Topic"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Assignment Confirmation */}
            <ConfirmationDialog
                open={deleteAssConfirm.open}
                title="Delete Assignment"
                content="Are you sure you want to delete this assignment? All associated student submissions and comments will be permanently removed."
                confirmText="Delete"
                confirmColor="error"
                onConfirm={handleDeleteAssignmentConfirm}
                onCancel={() => setDeleteAssConfirm({ open: false, assignment: null })}
            />

            {/* Delete Topic Confirmation */}
            <ConfirmationDialog
                open={deleteTopicConfirm.open}
                title="Delete Topic"
                content="Are you sure you want to delete this topic? Any assignments inside it will be moved to General Classwork."
                confirmText="Delete"
                confirmColor="error"
                onConfirm={handleDeleteTopicConfirm}
                onCancel={() => setDeleteTopicConfirm({ open: false, topic: null })}
            />

            {/* Student "Your Work" Overview Modal */}
            <Dialog
                open={openStudentWorkModal}
                onClose={() => setOpenStudentWorkModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.15)' } }}
            >
                <div className="student-work-modal-header">
                    <div className="user-profile-summary">
                        <Avatar
                            src={currUser?.image}
                            alt={currUser?.firstName}
                            sx={{ width: 48, height: 48, bgcolor: themeColor, fontSize: '1.2rem', fontWeight: 600 }}
                        >
                            {currUser?.firstName?.[0] || "U"}
                        </Avatar>
                        <div className="up-summary-text">
                            <h3>{currUser?.firstName} {currUser?.lastName}</h3>
                            <p>{currClass?.name} • Classwork Progress</p>
                        </div>
                    </div>
                    <IconButton size="small" onClick={() => setOpenStudentWorkModal(false)} className="sw-close-btn">
                        <CloseIcon />
                    </IconButton>
                </div>

                <Tabs
                    value={studentWorkTab}
                    onChange={(e, v) => setStudentWorkTab(v)}
                    variant="fullWidth"
                    TabIndicatorProps={{ style: { backgroundColor: themeColor, height: '3px', borderRadius: '3px 3px 0 0' } }}
                    sx={{ borderBottom: '1px solid #f1f5f9', minHeight: '48px', '& .Mui-selected': { color: `${themeColor} !important`, fontWeight: 600 } }}
                >
                    <Tab label="All" sx={{ textTransform: 'none', fontSize: '13.5px', fontFamily: 'inherit' }} />
                    <Tab label="Assigned" sx={{ textTransform: 'none', fontSize: '13.5px', fontFamily: 'inherit' }} />
                    <Tab label="Missing" sx={{ textTransform: 'none', fontSize: '13.5px', fontFamily: 'inherit' }} />
                    <Tab label="Done" sx={{ textTransform: 'none', fontSize: '13.5px', fontFamily: 'inherit' }} />
                </Tabs>

                <div className="student-work-modal-list">
                    {studentWorkStats.allItems
                        .filter((item) => {
                            if (studentWorkTab === 1) return item.status === "assigned";
                            if (studentWorkTab === 2) return item.status === "missing";
                            if (studentWorkTab === 3) return item.status === "done";
                            return true;
                        })
                        .map((item) => (
                            <div
                                key={item.assignment._id}
                                className="sw-list-item"
                                onClick={() => {
                                    setOpenStudentWorkModal(false);
                                    navigate(`/workarea/circle/${currClass._id}/assignment/${item.assignment._id}`);
                                }}
                            >
                                <div className="sw-item-left">
                                    <AssignmentIcon fontSize="small" sx={{ color: themeColor }} />
                                    <div>
                                        <h4>{item.assignment.name}</h4>
                                        <span className="sw-due">
                                            {item.dueDate ? `Due ${new Date(item.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}` : "No due date"}
                                        </span>
                                    </div>
                                </div>
                                <div className="sw-item-right">
                                    <span className={`sw-badge ${item.status}`}>
                                        {item.status === "done" ? "Turned in" : item.status === "missing" ? "Missing" : "Assigned"}
                                    </span>
                                </div>
                            </div>
                        ))}

                    {studentWorkStats.allItems.length === 0 && (
                        <div className="sw-empty-message">
                            No assignments in this category.
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    );
}

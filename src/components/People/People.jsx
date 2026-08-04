import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Avatar,
    Tooltip
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { addTeacherToClass } from '../../Api/apiCaller/classapicaller';
import toast from 'react-hot-toast';
import './People.css';

const People = () => {
    const currClass = useSelector((state) => state.classes.currClass);
    const currUser = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    const [openAddTeacher, setOpenAddTeacher] = useState(false);
    const [teacherEmail, setTeacherEmail] = useState('');
    const [adding, setAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const themeColor = currClass?.classTheme || '#00a896';

    const teachers = useMemo(() => {
        if (!currClass) return [];
        const list = [currClass.admin, ...(currClass.teacher || [])].filter(Boolean);
        const unique = [];
        const seen = new Set();
        list.forEach(t => {
            const id = t._id || t;
            if (!seen.has(id)) {
                seen.add(id);
                unique.push(t);
            }
        });
        return unique;
    }, [currClass]);

    const students = useMemo(() => {
        return currClass?.student || [];
    }, [currClass?.student]);

    const isAdmin = Boolean(
        currClass?.admin && currUser && (currClass.admin._id === currUser._id || currClass.admin === currUser._id)
    );
    const isAdminOrTeacher = Boolean(
        isAdmin ||
        (currClass?.teacher && currUser && currClass.teacher.some(t => (t._id === currUser._id || t === currUser._id || t.id === currUser._id)))
    );

    const handleAddTeacher = async (e) => {
        if (e) e.preventDefault();
        const emailTrimmed = teacherEmail.trim();
        if (!emailTrimmed) {
            toast.error("Please enter a valid email address");
            return;
        }

        setAdding(true);
        try {
            const success = await dispatch(addTeacherToClass({ classId: currClass._id, email: emailTrimmed, dispatch })).unwrap();
            if (success) {
                setOpenAddTeacher(false);
                setTeacherEmail('');
                toast.success("Teacher invitation sent successfully");
            }
        } catch (err) {
            console.error("Error adding teacher:", err);
        } finally {
            setAdding(false);
        }
    };

    const handleCopyClassCode = () => {
        if (!currClass?.entryCode) return;
        navigator.clipboard.writeText(currClass.entryCode);
        toast.success(`Class code "${currClass.entryCode}" copied to clipboard`);
    };

    const query = searchQuery.toLowerCase().trim();

    const filteredTeachers = useMemo(() => {
        if (!query) return teachers;
        return teachers.filter(t => {
            if (!t || typeof t !== 'object') return false;
            const name = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
            const email = (t.email || '').toLowerCase();
            return name.includes(query) || email.includes(query);
        });
    }, [teachers, query]);

    const filteredStudents = useMemo(() => {
        if (!query) return students;
        return students.filter(s => {
            if (!s || typeof s !== 'object') return false;
            const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
            const email = (s.email || '').toLowerCase();
            return name.includes(query) || email.includes(query);
        });
    }, [students, query]);

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
    };

    // User Row Component (Clean, without right tags or heavy background)
    const UserRow = ({ user, isLast }) => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Member';
        const isCurrentAuthUser = currUser?._id === user._id;

        return (
            <div className={`people-user-row ${isLast ? 'is-last' : ''}`}>
                <div className="people-user-main">
                    <Avatar
                        src={user.image}
                        alt={fullName}
                        sx={{
                            width: 38,
                            height: 38,
                            bgcolor: themeColor,
                            fontSize: '0.95rem',
                            fontWeight: 600
                        }}
                    >
                        {getInitials(user.firstName, user.lastName)}
                    </Avatar>

                    <div className="people-user-details">
                        <div className="people-user-name-row">
                            <span className="people-user-name">{fullName}</span>
                            {isCurrentAuthUser && (
                                <span className="current-user-tag">(You)</span>
                            )}
                        </div>
                        {user.email && (
                            <span className="people-user-email">{user.email}</span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="people-page-wrapper">
            <style>{`
                .people-page-wrapper {
                    --class-theme: ${themeColor};
                }
            `}</style>

            <div className="people-page-container">
                {/* Top Toolbar / Search & Class Code */}
                <div className="people-top-toolbar">
                    <div className="people-search-box">
                        <SearchIcon fontSize="small" sx={{ color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder="Search people by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <IconButton size="small" onClick={() => setSearchQuery("")}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </div>

                    {currClass?.entryCode && (
                        <button
                            type="button"
                            className="people-class-code-btn"
                            onClick={handleCopyClassCode}
                            title="Click to copy class code"
                        >
                            <span className="code-label">Class Code:</span>
                            <span className="code-value">{currClass.entryCode}</span>
                            <ContentCopyRoundedIcon fontSize="small" className="code-copy-icon" />
                        </button>
                    )}
                </div>

                {/* Teachers Section */}
                <section className="people-section-block">
                    <div className="people-section-header">
                        <h2 className="people-section-title">Teachers</h2>
                        <div className="people-section-header-right">
                            {isAdmin && (
                                <Tooltip title="Invite teacher" arrow>
                                    <IconButton
                                        onClick={() => setOpenAddTeacher(true)}
                                        className="people-header-icon-btn"
                                        sx={{ color: themeColor }}
                                    >
                                        <PersonAddOutlinedIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    <div className="people-section-divider" style={{ backgroundColor: themeColor }} />

                    <div className="people-users-list">
                        {filteredTeachers.length > 0 ? (
                            filteredTeachers.map((teacher, index) => (
                                <UserRow
                                    key={teacher._id || index}
                                    user={teacher}
                                    isLast={index === filteredTeachers.length - 1}
                                />
                            ))
                        ) : (
                            <div className="people-empty-row">
                                {searchQuery ? `No teachers matching "${searchQuery}"` : "No teachers in this class."}
                            </div>
                        )}
                    </div>
                </section>

                {/* Students / Classmates Section */}
                <section className="people-section-block">
                    <div className="people-section-header">
                        <h2 className="people-section-title">
                            {isAdminOrTeacher ? 'Students' : 'Classmates'}
                        </h2>
                        <div className="people-section-header-right">
                            <span className="people-count-text">
                                {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
                            </span>
                        </div>
                    </div>

                    <div className="people-section-divider" style={{ backgroundColor: themeColor }} />

                    <div className="people-users-list">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, index) => (
                                <UserRow
                                    key={student._id || index}
                                    user={student}
                                    isLast={index === filteredStudents.length - 1}
                                />
                            ))
                        ) : searchQuery ? (
                            <div className="people-empty-row">
                                No students matching "{searchQuery}"
                            </div>
                        ) : (
                            <div className="people-empty-row">
                                No students have joined this class yet.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Invite Teacher Dialog */}
            <Dialog
                open={openAddTeacher}
                onClose={() => !adding && setOpenAddTeacher(false)}
                className="global-dialog"
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
            >
                <form onSubmit={handleAddTeacher}>
                    <DialogTitle sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#0f172a', pb: 1 }}>
                        Invite Co-Teacher
                    </DialogTitle>
                    <DialogContent>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px', marginTop: '4px', lineHeight: 1.5 }}>
                            Enter the email address of the teacher you want to add. They will have full permissions to manage classwork and assignments.
                        </p>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Teacher Email Address"
                            type="email"
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="teacher@example.com"
                            value={teacherEmail}
                            onChange={(e) => setTeacherEmail(e.target.value)}
                            required
                            disabled={adding}
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                        <Button
                            onClick={() => setOpenAddTeacher(false)}
                            disabled={adding}
                            sx={{ textTransform: 'none', color: '#64748b', borderRadius: '8px' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={adding || !teacherEmail.trim()}
                            style={{
                                backgroundColor: themeColor,
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                px: 2.5
                            }}
                        >
                            {adding ? 'Inviting...' : 'Invite'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default People;
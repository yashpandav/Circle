import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import "./circleStaticNav.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateClassDetails, deleteClassAction, leaveClassAction, changeEntryCode } from "../../Api/apiCaller/classapicaller";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl } from "@mui/material";
import ConfirmationDialog from "../Helper/ConfirmationDialog";

export default function CircleStaticNavbar() {
    const currClass = useSelector((state) => state.classes.currClass);
    const currUser = useSelector((state) => state.auth.user);

    const [activeTab, setActiveTab] = useState("Stream");
    const [isAdmin, setAdmin] = useState(false);
    const [isStudent, setIsStudent] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [editData, setEditData] = useState({ name: "", subject: "", studentCanPost: true });
    const [confirmConfig, setConfirmConfig] = useState({ open: false, title: '', content: '', action: null, confirmColor: 'primary', confirmText: 'Confirm' });
    const dispatch = useDispatch();

    useEffect(() => {
        if (currUser && currClass) {
            if (currClass.admin && currUser._id === currClass.admin._id) {
                setAdmin(true);
            }
            if (currClass.student.some(s => s._id === currUser._id)) {
                setIsStudent(true);
            }
            setEditData({ name: currClass.name || "", subject: currClass.subject || "", studentCanPost: currClass.studentCanPost !== false });
        }
    }, [currUser, currClass]);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname.toLowerCase();
        if (path.includes('/people')) {
            setActiveTab('People');
        } else if (path.includes('/classwork')) {
            setActiveTab('Classwork');
        } else if (path.includes('/stream')) {
            setActiveTab('Stream');
        } else {
            setActiveTab('');
        }
    }, [location.pathname]);

    const navItems = ["Stream", "Classwork", "People"];

    const handleUpdate = async () => {
        await dispatch(updateClassDetails({ id: currClass._id, data: editData, dispatch })).unwrap();
        setOpenSettings(false);
    };

    const handleDelete = () => {
        setConfirmConfig({
            open: true,
            title: "Delete Class",
            content: "Are you sure you want to permanently delete this class? This action cannot be undone.",
            confirmText: "Delete",
            confirmColor: "error",
            action: async () => {
                await dispatch(deleteClassAction({ id: currClass._id, navigate })).unwrap();
                setOpenSettings(false);
                setConfirmConfig({ ...confirmConfig, open: false });
            }
        });
    };

    const handleLeave = () => {
        setConfirmConfig({
            open: true,
            title: "Leave Class",
            content: "Are you sure you want to leave this class?",
            confirmText: "Leave",
            confirmColor: "error",
            action: async () => {
                await dispatch(leaveClassAction({ classId: currClass._id, navigate })).unwrap();
                setOpenSettings(false);
                setConfirmConfig({ ...confirmConfig, open: false });
            }
        });
    };

    const handleResetCode = () => {
        setConfirmConfig({
            open: true,
            title: "Reset Code",
            content: "Reset entry code? Old code will no longer work.",
            confirmText: "Reset",
            confirmColor: "primary",
            action: async () => {
                await dispatch(changeEntryCode({ id: currClass._id, dispatch })).unwrap();
                setConfirmConfig({ ...confirmConfig, open: false });
            }
        });
    };

    return (
        <div className="navbar-container">
            <div className="circle-navbar">
                {navItems.map((item) => (
                    <div
                        key={item}
                        className={`navbar-list ${activeTab === item ? 'active-tab' : ''}`}
                        onClick={() => {
                            navigate(`/workarea/circle/${currClass._id}/${item.toLowerCase()}`);
                        }}
                    >
                        <h3>
                            {item}
                        </h3>
                    </div>
                ))}
            </div>
            <div className="navbar-setting-class" onClick={() => setOpenSettings(true)}>
                <SettingsOutlinedIcon className="settings-icon" style={{ cursor: 'pointer', color: '#5f6368' }} />
            </div>

            <Dialog
                open={openSettings}
                onClose={() => setOpenSettings(false)}
                maxWidth="sm"
                fullWidth
                className="global-dialog"
            >
                <DialogTitle className="global-dialog-title">
                    Class Settings
                </DialogTitle>
                <DialogContent className="global-dialog-content">
                    {isAdmin && (
                        <div style={{ paddingTop: '16px' }}>
                            {/* Derive isActive state backward-compatibly */}
                            {(() => {
                                const isActive = currClass.isCodeActive !== false;
                                return (
                                    <>
                                        <h3 style={{ marginTop: 0, fontWeight: 600, color: 'var(--class-theme, #1967d2)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class Details</h3>
                            <TextField
                                label="Class Name"
                                fullWidth
                                margin="normal"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />
                            <TextField
                                label="Subject"
                                fullWidth
                                margin="normal"
                                value={editData.subject}
                                onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                            />

                            <h3 style={{ marginTop: '32px', fontWeight: 600, color: 'var(--class-theme, #1967d2)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>General</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class Code</div>
                                    <div style={{ color: isActive ? '#0f172a' : '#94a3b8', fontSize: '1.25rem', marginTop: '4px', letterSpacing: isActive ? '2px' : '0px', fontWeight: 700 }}>
                                        {isActive ? currClass.entryCode : 'TURNED OFF'}
                                    </div>
                                </div>
                                {isActive && (
                                    <Button variant="outlined" onClick={handleResetCode} style={{ borderColor: 'var(--class-theme, #1967d2)', color: 'var(--class-theme, #1967d2)', borderRadius: '24px', textTransform: 'none', fontWeight: 600, padding: '6px 20px' }}>Reset Code</Button>
                                )}
                            </div>
                            
                            <h3 style={{ marginTop: '32px', fontWeight: 600, color: 'var(--class-theme, #1967d2)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stream Settings</h3>
                            <div style={{ marginBottom: '8px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={editData.studentCanPost}
                                        onChange={(e) => setEditData({ ...editData, studentCanPost: e.target.value })}
                                        style={{ backgroundColor: 'white' }}
                                    >
                                        <MenuItem value={true}>Students can post information</MenuItem>
                                        <MenuItem value={false}>Only teachers can post information</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {isStudent && (
                        <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                            <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '24px' }}>You are currently enrolled as a student in this class.</p>
                            <Button variant="outlined" color="error" onClick={handleLeave} style={{ borderRadius: '24px', padding: '8px 24px', textTransform: 'none', fontWeight: 600, borderWidth: '2px' }}>Leave Class</Button>
                        </div>
                    )}
                </DialogContent>
                {isAdmin && (
                    <DialogActions className="global-dialog-actions" style={{ justifyContent: 'space-between' }}>
                        <Button color="error" onClick={handleDelete} style={{ textTransform: 'none', fontWeight: 600, borderRadius: '24px', padding: '8px 20px' }}>Delete Class</Button>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button onClick={() => setOpenSettings(false)} variant="outlined" className="global-dialog-btn-cancel">Cancel</Button>
                            <Button variant="contained" className="global-dialog-btn-submit" onClick={handleUpdate}>Save</Button>
                        </div>
                    </DialogActions>
                )}
            </Dialog>

            <ConfirmationDialog 
                open={confirmConfig.open}
                title={confirmConfig.title}
                content={confirmConfig.content}
                confirmText={confirmConfig.confirmText}
                confirmColor={confirmConfig.confirmColor}
                onConfirm={confirmConfig.action}
                onCancel={() => setConfirmConfig({ ...confirmConfig, open: false })}
            />

        </div>
    );
}
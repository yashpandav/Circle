import React, { useState , useEffect } from "react";
import { useSelector } from "react-redux";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import "./circleStaticNav.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateClassDetails, deleteClassAction, leaveClassAction, changeEntryCode } from "../../Api/apiCaller/classapicaller";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function CircleStaticNavbar() {
    const currClass = useSelector((state) => state.classes.currClass);
    const currUser = useSelector((state) => state.auth.user);

    const [activeTab, setActiveTab] = useState("Stream");
    const [isAdmin, setAdmin] = useState(false);
    const [isStudent, setIsStudent] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [editData, setEditData] = useState({ name: "", subject: "" });
    const dispatch = useDispatch();

    useEffect(() => {
        if(currUser && currClass) {
            if (currClass.admin && currUser._id === currClass.admin._id) {
                setAdmin(true);
            }
            if (currClass.student.some(s => s._id === currUser._id)) {
                setIsStudent(true);
            }
            setEditData({ name: currClass.name || "", subject: currClass.subject || "" });
        }
    }, [currUser, currClass]);

    const navigate = useNavigate();

    const navItems = ["Stream", "Classwork", "People"];

    const handleUpdate = async () => {
        await dispatch(updateClassDetails({ id: currClass._id, data: editData, dispatch })).unwrap();
        setOpenSettings(false);
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to permanently delete this class?")) {
            await dispatch(deleteClassAction({ id: currClass._id, navigate })).unwrap();
            setOpenSettings(false);
        }
    };

    const handleLeave = async () => {
        if (window.confirm("Are you sure you want to leave this class?")) {
            await dispatch(leaveClassAction({ classId: currClass._id, navigate })).unwrap();
            setOpenSettings(false);
        }
    };

    const handleResetCode = async () => {
        if (window.confirm("Reset entry code? Old code will no longer work.")) {
            await dispatch(changeEntryCode({ id: currClass._id, dispatch })).unwrap();
        }
    };

    return (
        <div
            className="navbar-container"
            style={{
                borderBottom: `1px solid #e2e8f0`,
            }}
        >
            <div className="circle-navbar">
                {navItems.map((item) => (
                    <div
                        key={item}
                        className={`navbar-list ${activeTab === item ? 'active-tab' : ''}`}
                        onClick={() => {
                            setActiveTab(item);
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

            <Dialog open={openSettings} onClose={() => setOpenSettings(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Class Settings
                    <IconButton onClick={() => setOpenSettings(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {isAdmin && (
                        <>
                            <h3 style={{ marginTop: 0, fontWeight: 500, color: '#1967d2' }}>Class Details</h3>
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
                            
                            <h3 style={{ marginTop: '24px', fontWeight: 500, color: '#1967d2' }}>General</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>Class Code</div>
                                    <div style={{ color: '#5f6368', fontSize: '14px' }}>{currClass.entryCode}</div>
                                </div>
                                <Button variant="outlined" onClick={handleResetCode}>Reset Code</Button>
                            </div>
                        </>
                    )}
                    
                    {isStudent && (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p>You are currently enrolled as a student in this class.</p>
                            <Button variant="outlined" color="error" onClick={handleLeave}>Leave Class</Button>
                        </div>
                    )}
                </DialogContent>
                {isAdmin && (
                    <DialogActions style={{ justifyContent: 'space-between', padding: '16px 24px' }}>
                        <Button color="error" onClick={handleDelete}>Delete Class</Button>
                        <div>
                            <Button onClick={() => setOpenSettings(false)} style={{ marginRight: '8px' }}>Cancel</Button>
                            <Button variant="contained" color="primary" onClick={handleUpdate}>Save</Button>
                        </div>
                    </DialogActions>
                )}
            </Dialog>
        </div>
    );
}
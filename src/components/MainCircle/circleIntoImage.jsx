import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import "./circleIntroImage.css";
import ColorSelector from "../Helper/colorSelector";
import { useDispatch } from "react-redux";
import { updateClassDetails } from "../../Api/apiCaller/classapicaller";
import { Button, styled } from "@mui/material";
import { CloudUploadOutlined } from "@mui/icons-material";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

export default function CircleIntroImage() {
    const currUser = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminName, setAdminName] = useState(`${currClass.admin.firstName} ${currClass.admin.lastName}`);
    const [toggleInfoContainer, setToggleInfoContainer] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedColor, setselectedColor] = useState(null);
    const [file, setFile] = useState(null);

    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() => {
        setAdminName(`${currClass.admin.firstName} ${currClass.admin.lastName}`);
        if (currClass && currUser && currClass?.admin?._id === currUser?._id) {
            setIsAdmin(true);
        }
    }, [currClass, currUser]);

    const toggleInfo = () => {
        setToggleInfoContainer(!toggleInfoContainer);
    };

    const showUpdateCustomize = () => {
        setOpenModal(true);
    };

    const handleClose = () => {
        setOpenModal(false);
        setselectedColor(null);
        setFile(null);
    };

    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        const formData = new FormData();
        if (selectedColor) formData.append('classTheme', selectedColor);
        if (file) formData.append('thumbnail', file);
    
        try {
            await dispatch(updateClassDetails({ id: currClass._id, data: formData, dispatch })).unwrap();
            handleClose();
        } catch (err) {
            console.error("SOMETHING WENT WRONG WHILE SENDING API FUNCTION", err);
        } finally {
            setLoading(false);
        }
    };

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const StyledButton = styled(Button)({
        fontFamily: "'Google Sans', sans-serif",
        textTransform: 'none',
        borderRadius: '24px',
        padding: '8px 24px',
        backgroundColor: '#f1f3f4',
        color: '#202124',
        '&:hover': {
            backgroundColor: '#e8eaed',
        }
    });

    return (
        <>
            <div
                className={`circle-intro-image ${toggleInfoContainer ? 'hide-border' : ''}`}
                style={{ backgroundImage: `url(${currClass.thumbnail})` }}
            >
                {isAdmin && (
                    <button className="customize-circle-btn" onClick={showUpdateCustomize}>
                        <CreateOutlinedIcon />
                        <span>Customize</span>
                    </button>
                )}

                <div className="circle-content">
                    <h3 className="curr-circle-name">{currClass.name}</h3>
                    <InfoTwoToneIcon
                        className={`info-icon ${toggleInfoContainer ? 'toggleInfoIcon' : ''}`}
                        onClick={toggleInfo}
                    />
                </div>
            </div>

            {toggleInfoContainer && (
                <div className={`circle-info-container ${toggleInfoContainer ? 'show' : ''}`}>
                    <div className="info-group">
                        <div className="info-item">
                            <span className="info-label">Created By</span>
                            <span className="info-value">{adminName}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Created On</span>
                            <span className="info-value">{formatDate(currClass.createDate)}</span>
                        </div>
                    </div>
                    <div className="info-group center-group">
                        <div className="info-item">
                            <span className="info-label">Subject</span>
                            <span className="info-value">{currClass.subject || "N/A"}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Description</span>
                            <span className="info-value">{currClass.description || "No description provided."}</span>
                        </div>
                    </div>
                    <div className="info-group right-group">
                        <div className="info-item">
                            <span className="info-label">Total Students</span>
                            <span className="info-value">{currClass.student?.length || 0}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Total Teachers</span>
                            <span className="info-value">{currClass.teacher?.length || 0}</span>
                        </div>
                    </div>
                </div>
            )}

            {openModal && (
                <MuiDialog
                    open={true}
                    onClose={handleClose}
                    aria-labelledby="customize-appearance-title"
                    className="global-dialog"
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle id="customize-appearance-title" className="global-dialog-title">
                        Customize Appearance
                    </DialogTitle>
                    <DialogContent className="global-dialog-content">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '16px' }}>
                            <div>
                                <StyledButton
                                    component="label"
                                    variant="contained"
                                    startIcon={<CloudUploadOutlined />}
                                    fullWidth
                                >
                                    Select Stream Header Image
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                </StyledButton>
                                {file && <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>Selected: {file.name}</p>}
                            </div>
                            <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>Select Theme Color:</p>
                                <ColorSelector setselectedColor={setselectedColor} selectedColor={selectedColor} />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions className="global-dialog-actions">
                        <Button onClick={handleClose} variant="outlined" className="global-dialog-btn-cancel">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} variant="contained" className="global-dialog-btn-submit" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogActions>
                </MuiDialog>
            )}
        </>
    );
}

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

    const handleSubmit = async () => {
        const formData = new FormData();
        if (selectedColor) formData.append('classTheme', selectedColor);
        if (file) formData.append('thumbnail', file);
    
        try {
            await dispatch(updateClassDetails({ id: currClass._id, data: formData, dispatch })).unwrap();
        } catch (err) {
            console.error("SOMETHING WENT WRONG WHILE SENDING API FUNCTION", err);
        }

        handleClose();
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
                <div className="custom-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4>Customize Appearance</h4>
                            <button onClick={handleClose} className="close-btn">&times;</button>
                        </div>
                        <div className="modal-body">
                            <StyledButton
                                component="label"
                                variant="contained"
                                startIcon={<CloudUploadOutlined />}
                            >
                                Select Stream Header Image
                                <VisuallyHiddenInput
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                            </StyledButton>
                            {file && <p>Selected file: {file.name}</p>}

                            <ColorSelector setselectedColor={setselectedColor} selectedColor={selectedColor} />
                        </div>
                        <div className="modal-footer">
                            <button className="save-btn" onClick={handleSubmit}>Save</button>
                            <button className="cancel-btn" onClick={handleClose}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

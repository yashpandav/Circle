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

    useEffect(() => {
        setAdminName(`${currClass.admin.firstName} ${currClass.admin.lastName}`);
        if (currClass && currUser && currClass.admin._id === currUser._id) {
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
            dispatch(updateClassDetails({ id: currClass._id, data: formData }));
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
                        <h3 className="info-header">Created By: <span>{adminName}</span></h3>
                        <h3 className="info-header">Description: <span>{currClass.description}</span></h3>
                        <h3 className="info-header">Subject: <span>{currClass.subject}</span></h3>
                    </div>
                    <div className="info-group">
                        <h3 className="info-header">Create Date: <span>{currClass.createDate}</span></h3>
                        <h3 className="info-header">Total Students: <span>{currClass.student.length}</span></h3>
                        <h3 className="info-header">Total Teachers: <span>{currClass.teacher.length}</span></h3>
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
                            <Button
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
                            </Button>
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

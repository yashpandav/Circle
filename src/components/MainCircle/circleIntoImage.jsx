import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import "./circleIntroImage.css";
import ColorSelector from "../Helper/colorSelector";
import { useDispatch } from "react-redux";
import { updateClassDetails } from "../../Api/apiCaller/classapicaller";

export default function CircleIntroImage() {
    const currUser = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);
    const [adminFirstName, setAdminFirstName] = useState(currClass.admin.firstName);
    const [adminLastName, setAdminLastName] = useState(currClass.admin.lastName);
    const [toggleInfoContainer, setToggleInfoContainer] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [selectedColor, setselectedColor] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        setAdminFirstName(currClass.admin.firstName);
        setAdminLastName(currClass.admin.lastName);
    }, []);

    useEffect(() => {
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
        formData.append('classTheme', selectedColor);
        formData.append('thumbnail', file);
    
        let id = currClass._id;
        try {
            console.log(formData);
            dispatch(updateClassDetails({ id, data: formData , dispatch }));
        } catch (err) {
            console.log(err);
            console.error("SOMETHING WENT WRONG WHILE SENDING API FUNCTION");
        }

        handleClose();
    };
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

                {toggleInfoContainer && (
                    <span className="temp-circle-info-icon"></span>
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
                        <h3 className="info-header">Created By: <span>{adminFirstName} {adminLastName}</span></h3>
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

            {/* Modal Implementation */}
            {openModal && (
                <div className="custom-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4>Customize Appearance</h4>
                            <button onClick={handleClose} className="close-btn">&times;</button>
                        </div>
                        <div className="modal-body">
                            <p className="file-upload-label">
                                Select Stream Header Image
                            </p>
                            <input
                                type="file"
                                id="header-image"
                                name="header-image"
                                accept="image/*"
                                className="file-upload-input"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
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

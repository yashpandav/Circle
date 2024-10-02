import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import "./circleIntroImage.css";

export default function CircleIntroImage() {
    const currClass = useSelector((state) => state.classes.currClass);
    const [adminFirstName, setAdminFirstName] = useState(currClass.admin.firstName);
    const [adminLastName, setAdminLastName] = useState(currClass.admin.lastName);
    const currUser = useSelector((state) => state.auth.user);
    const [toggleInfoContainer, setToggleInfoContainer] = useState(false);
    const [isAdmin , setIsAdmin] = useState(false);

    useEffect(() => {
        setAdminFirstName(currClass.admin.firstName);
        setAdminLastName(currClass.admin.lastName);
    }, []);

    useEffect(() =>{
        if(currClass && currUser && currClass.admin._id === currUser._id){
            setIsAdmin(true);
        }
    } , [currClass , currUser]);

    const toggleInfo = () => {
        setToggleInfoContainer(!toggleInfoContainer);
    };

    return (
        <>
            <div
                className={`circle-intro-image ${toggleInfoContainer ? 'hide-border' : ''}`}
                style={{ backgroundImage: `url(${currClass.thumbnail})` }}
            >
                {
                    isAdmin && (
                        <button className="customize-circle-btn">
                            <CreateOutlinedIcon />
                            <span>Customize</span>
                        </button>
                    )
                }
                
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
        </>
    );
}
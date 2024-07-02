import React, { useState } from "react";
import { useSelector } from "react-redux";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import "./circleIntroImage.css";

export default function CircleIntroImage() {
    const currClass = useSelector((state) => state.classes.currClass);
    const [toggleInfoContainer, setToggleInfoContainer] = useState(false);

    const toggleInfo = () => {
        setToggleInfoContainer(!toggleInfoContainer);
    };

    return (
        <div className="main-circle-top-container">
            <div
                className={
                    `circle-intro-image  ${toggleInfoContainer ? 'hide-border' : ''}`
                }
                style={{ backgroundImage: `url(${currClass.thumbnail})`}}
            >
                {
                    toggleInfoContainer && (
                        <span className="temp-circle-info-icon">
                        </span>
                    )
                }
                <div className={`circle-content`}>
                    <h3 className="curr-circle-name">{currClass.name}</h3>
                    <InfoTwoToneIcon
                        className={`info-icon ${toggleInfoContainer ? 'toggleInfoIcon' : ''}`}
                        onClick={toggleInfo}
                    />
                </div>
            </div>
            {
                toggleInfoContainer && (
                    <div className={`circle-info-container ${toggleInfoContainer ? 'show' : ''}`}>
                        <div className="info-group">
                            <h3 className="info-header">Created By: <span>{currClass.admin.firstName} {currClass.admin.lastName}</span></h3>
                            <h3 className="info-header">Description: <span>{currClass.description}</span></h3>
                            <h3 className="info-header">Subject: <span>{currClass.subject}</span></h3>
                        </div>
                        <div className="info-group">
                            <h3 className="info-header">Create Date: <span>{currClass.createDate}</span></h3>
                            <h3 className="info-header">Total Students: <span>{currClass.student.length}</span></h3>
                            <h3 className="info-header">Total Teachers: <span>{currClass.teacher.length}</span></h3>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

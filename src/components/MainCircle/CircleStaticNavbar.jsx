import React from "react";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { useSelector } from "react-redux";
import { SiGoogleclassroom } from "react-icons/si";
import "./circleStaticNav.css";

export default function CircleStaticNavbar() {
    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div className="navbar-container" style={{
            borderBottom : `2px solid ${currClass.classTheme}`,
        }}>
            <div className="circle-navbar">
                <div className="navbar-list">
                    <SiGoogleclassroom className="icon" />
                    <h3>Circle</h3>
                </div>
                <div className="navbar-list">
                    <AssignmentOutlinedIcon className="icon" />
                    <h3>Task</h3>
                </div>
                <div className="navbar-list">
                    <PeopleAltOutlinedIcon className="icon" />
                    <h3>People</h3>
                </div>
            </div>
        </div>
    );
}

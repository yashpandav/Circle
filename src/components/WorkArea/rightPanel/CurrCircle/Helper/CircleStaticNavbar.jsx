
import React from "react";
import { GrDomain } from "react-icons/gr";
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { useSelector } from "react-redux";
import './circleStaticNav.css';

export default function CircleStaticNavbar() {

    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }} >
            <div className="circle-navbar" style={{
                '--navbar-shadow': `0 2px 3px ${currClass.classTheme}`
            }}>
                <div className="navbar-list">
                    <GrDomain className="icon" />
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

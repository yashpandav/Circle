import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Divider } from "@mui/material";
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getClass } from "../../../../../Api/apiCaller/classapicaller";
import "./classBox.css";

export const Classes = ({ item, index }) => {
    const { admin } = item;

    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const navigate = useNavigate();
    
    let name = item.name;
    if (name.length > 20) {
        name = name.slice(0, 20);
    }

    function handleMavigateToCircle(){
        //* ONCLICK TAKE USER TO THAT PARTICULAR CLASS
        const id = item._id;
        dispatch(getClass({id , dispatch , navigate}));
    }

    return (
        <div className={`${name.length > 19 ? 'overflowed-text' : ''} class`} key={index} onClick={handleMavigateToCircle}>
            <div
                className="header-class"
                style={{
                    backgroundImage: `url(${item.thumbnail})`,
                }}
            >
                <div className="header-text-content">
                    <h2 className="class-title">{item.name}</h2>
                    <p className="class-description">{item.description}</p>
                </div>
                <MoreVertIcon className="more-icon" />
            </div>

            <div className="admin-info">
                <span className="admin-name">{admin.firstName} {admin.lastName}</span>
                {admin.image && (
                    <img src={admin.image} alt="admin-img" className="admin-img" />
                )}
            </div>

            <div className="content-class">
                {/* Reserved for future assignment lists, left intentionally blank to match Google Classroom */}
            </div>

            <div className="footer-class">
                <div className="icons">
                    <AssignmentOutlinedIcon />
                    <FolderOpenOutlinedIcon />
                </div>
            </div>
        </div>
    );
};

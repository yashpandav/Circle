import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Divider } from "@mui/material";
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCurrClass } from "../../../../../Slices/classSlice";
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
                <MoreVertIcon
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        zIndex: 1,
                    }}
                />
                <h2>{item.name}</h2>
                <p>{item.description}</p>
            </div>
            <div className="admin-info">
                <span>{admin.firstName} {admin.lastName}</span>
                {admin.image && (
                    <img src={admin.image} alt="admin-img" className="admin-img" />
                )}
            </div>
            <div className="plain-div"></div>
            <Divider />
            <div className="footer-class">
                <div className="student-teacher">
                    <p>Total Students: {item.student.length}</p>
                    <p>Total Teachers: {item.teacher.length}</p>
                </div>
                <div className="icons">
                    {
                        user._id === admin._id ? <RateReviewOutlinedIcon/> : <TaskOutlinedIcon/>
                    }
                </div>
            </div>
        </div>
    );
};

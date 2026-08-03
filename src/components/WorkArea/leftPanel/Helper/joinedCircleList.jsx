import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getClass } from "../../../../Api/apiCaller/classapicaller";
import { joinedClass } from "../../../../Api/apiCaller/userapicaller";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import "./joinedCircleList.css";

function CircleItem({ item }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = location.pathname.includes(item._id);
    const initial = (item.name || "C").charAt(0).toUpperCase();
    const themeColor =
        !item.classTheme || item.classTheme === "#FFFFFF"
            ? "#4285f4"
            : item.classTheme;

    function handleNavigate() {
        dispatch(getClass({ id: item._id, dispatch, navigate }));
    }

    return (
        <div
            className={`jcl-item ${isActive ? "jcl-item--active" : ""}`}
            style={{ "--item-theme": themeColor }}
            onClick={handleNavigate}
            title={item.name}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
        >
            <div className="jcl-avatar">
                {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.name} className="jcl-avatar-img" />
                ) : (
                    <span className="jcl-avatar-initial">{initial}</span>
                )}
            </div>
            <div className="jcl-info">
                <span className="jcl-name">{item.name}</span>
                {item.admin && (
                    <span className="jcl-admin">
                        {item.admin.firstName} {item.admin.lastName}
                    </span>
                )}
            </div>
        </div>
    );
}

function EmptyState({ label }) {
    return (
        <div className="jcl-empty">
            <SchoolOutlinedIcon className="jcl-empty-icon" />
            <p>{label}</p>
        </div>
    );
}

export function JoinedCircleListTeacher() {
    const dispatch = useDispatch();
    const teacherClasses = useSelector(
        (state) => state.classes.joinedClassesAsTeacher
    );

    useEffect(() => {
        if (!teacherClasses) {
            dispatch(joinedClass({ dispatch }));
        }
    }, [dispatch, teacherClasses]);

    const classes = teacherClasses || [];

    return (
        <div className="jcl-list">
            {classes.length > 0 ? (
                classes.map((item) => (
                    <CircleItem key={item._id} item={item} />
                ))
            ) : (
                <EmptyState label="No circles as teacher" />
            )}
        </div>
    );
}

export function JoinedCircleListStudent() {
    const dispatch = useDispatch();
    const studentClasses = useSelector(
        (state) => state.classes.joinedClassesAsStudent
    );

    useEffect(() => {
        if (!studentClasses) {
            dispatch(joinedClass({ dispatch }));
        }
    }, [dispatch, studentClasses]);

    const classes = studentClasses || [];

    return (
        <div className="jcl-list">
            {classes.length > 0 ? (
                classes.map((item) => (
                    <CircleItem key={item._id} item={item} />
                ))
            ) : (
                <EmptyState label="No circles as student" />
            )}
        </div>
    );
}
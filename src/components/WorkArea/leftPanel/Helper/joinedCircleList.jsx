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
    const createdClasses = useSelector(
        (state) => state.classes.createdClasses
    );

    useEffect(() => {
        if (teacherClasses === null || createdClasses === null) {
            dispatch(joinedClass({ dispatch }));
        }
    }, [dispatch, teacherClasses, createdClasses]);

    // Merge created classes and joined-as-teacher classes (deduplicated by _id)
    const teacherList = React.useMemo(() => {
        const teacher = Array.isArray(teacherClasses) ? teacherClasses : [];
        const created = Array.isArray(createdClasses) ? createdClasses : [];
        const map = new Map();
        [...created, ...teacher].forEach((c) => {
            if (c && c._id && !map.has(c._id.toString())) {
                map.set(c._id.toString(), c);
            }
        });
        return Array.from(map.values());
    }, [teacherClasses, createdClasses]);

    return (
        <div className="jcl-list">
            {teacherList.length > 0 ? (
                teacherList.map((item) => (
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
    const teacherClasses = useSelector(
        (state) => state.classes.joinedClassesAsTeacher
    );
    const createdClasses = useSelector(
        (state) => state.classes.createdClasses
    );

    useEffect(() => {
        if (studentClasses === null) {
            dispatch(joinedClass({ dispatch }));
        }
    }, [dispatch, studentClasses]);

    // Enrolled circles strictly excluding any teaching circle
    const studentList = React.useMemo(() => {
        const students = Array.isArray(studentClasses) ? studentClasses : [];
        const teacher = Array.isArray(teacherClasses) ? teacherClasses : [];
        const created = Array.isArray(createdClasses) ? createdClasses : [];

        const teachingIds = new Set();
        [...created, ...teacher].forEach((c) => {
            if (c && c._id) teachingIds.add(c._id.toString());
        });

        const seen = new Set();
        return students.filter((item) => {
            if (!item || !item._id) return false;
            const idStr = item._id.toString();
            if (teachingIds.has(idStr)) return false;
            if (seen.has(idStr)) return false;
            seen.add(idStr);
            return true;
        });
    }, [studentClasses, teacherClasses, createdClasses]);

    return (
        <div className="jcl-list">
            {studentList.length > 0 ? (
                studentList.map((item) => (
                    <CircleItem key={item._id} item={item} />
                ))
            ) : (
                <EmptyState label="No circles as student" />
            )}
        </div>
    );
}
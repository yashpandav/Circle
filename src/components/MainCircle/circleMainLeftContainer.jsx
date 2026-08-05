import React, { useMemo } from "react";
import ClassCodeComponent from "./LeftSideHelper/classCode.jsx";
import TaskSummaryComponent from "./LeftSideHelper/taskSummary.jsx";
import CategoriesComponent from "./LeftSideHelper/categories.jsx";
import { useSelector } from "react-redux";
import './circleMainLeftContainer.css';

export default function CircleMainLeftContainer() {
    const currClass = useSelector((state) => state.classes?.currClass);
    const user = useSelector((state) => state.auth?.user);

    const isAdminOrTeacher = useMemo(() => {
        if (!user || !currClass) return false;
        const isAdmin = Boolean(
            currClass.admin && (currClass.admin._id === user._id || currClass.admin === user._id)
        );
        const isTeacher = Boolean(
            Array.isArray(currClass.teacher) &&
            currClass.teacher.some(t => (t._id === user._id || t === user._id || t.id === user._id))
        );
        return isAdmin || isTeacher;
    }, [user, currClass]);

    return (
        <div className="circle-main-left-container">
            {isAdminOrTeacher && <ClassCodeComponent />}
            <TaskSummaryComponent />
            <CategoriesComponent />
        </div>
    );
}

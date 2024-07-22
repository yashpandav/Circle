import React, { useEffect, useState } from "react";
import ClassCodeComponent from "./LeftSideHelper/classCode.jsx";
import TaskSummaryComponent from "./LeftSideHelper/taskSummary.jsx";
import { useSelector } from "react-redux";
import './circleMainLeftContainer.css';

export default function CircleMainLeftContainer() {
    const currClass = useSelector((state) => state.classes?.currClass);
    const user = useSelector((state) => state.auth?.user);

    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        if (user && currClass && user._id === currClass.admin._id) {
            setAdmin(true);
        }
    }, [user, currClass]);

    return (
        <div className="circle-main-left-container">
            {admin && <ClassCodeComponent />}
            <TaskSummaryComponent />
        </div>
    );
}

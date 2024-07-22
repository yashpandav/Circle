import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./taskSummary.css";

export default function TaskSummaryComponent() {
    const currClass = useSelector((state) => state.classes.currClass);

    const [assignments, setAssignments] = useState([]);
    const [topAssignments, setTopAssignments] = useState(null);

    useEffect(() => {
        setAssignments(currClass.addedAssignment);
    }, [currClass.addedAssignment]);

    useEffect(() => {
        if (assignments.length > 0) {
            assignmentArranger();
        }
    }, [assignments]);

    function assignmentArranger() {
        const sortedAssignments = [...assignments].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        setTopAssignments(sortedAssignments[0]);
    }

    return (
        <div className="task-summary-container">
            <div className="task-summary-header" style={{
                borderColor: currClass.classTheme
            }}>
                <pre style={{
                    color: currClass.classTheme
                }}>Task</pre>
            </div>
            <div className="task-list">
                {assignments.length === 0 ? (
                    <div className="no-task-message">𝑯𝒐𝒐𝒓𝒂𝒚 ! 𝑵𝒐 𝒕𝒂𝒔𝒌 𝒂𝒅𝒅𝒆𝒅 𝒚𝒆𝒕🥳</div>
                ) : (
                    <>
                        <div className="task-item">
                            <h6>DUE BY</h6>
                            <h4>{topAssignments.dueDate}</h4>
                            <p>{topAssignments.name}</p>
                        </div>
                        <p className="show-more">+ 3 more</p>
                    </>
                )}
            </div>
        </div>
    );
}
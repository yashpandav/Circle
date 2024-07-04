import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./taskSummary.css";

export default function TaskSummaryComponent() {
    const currClass = useSelector((state) => state.classes.currClass);

    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        setAssignments(currClass.addedAssignment);
    }, [currClass.addedAssignment]);

    console.log(assignments);

    return (
        <div className="task-summary-container">
            <div className="task-summary-header">
                <pre>Task</pre>
            </div>
            <div className="task-list">
                {assignments.length === 0 ? (
                    <div className="no-task-message">No tasks added yet 🥳</div>
                ) : (
                    assignments.map((assignment, index) => (
                        <div key={index} className="task-item">
                            <h4>{assignment.title}</h4>
                            <p>{assignment.description}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

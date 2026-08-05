import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./taskSummary.css";

const formatDueDateShort = (dateStr) => {
    if (!dateStr) return "No due date";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "No due date";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (isToday) return `Today, ${timeStr}`;
    if (isTomorrow) return `Tomorrow, ${timeStr}`;

    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
};

export default function TaskSummaryComponent() {
    const currClass = useSelector((state) => state.classes?.currClass);
    const navigate = useNavigate();

    const { upcomingAssignments, totalCount } = useMemo(() => {
        const rawList = currClass?.addedAssignment;
        if (!Array.isArray(rawList) || rawList.length === 0) {
            return { upcomingAssignments: [], totalCount: 0 };
        }

        // Filter valid objects
        const validAssignments = rawList.filter(
            (item) => item && typeof item === "object" && item._id
        );

        if (validAssignments.length === 0) {
            return { upcomingAssignments: [], totalCount: 0 };
        }

        // Sort by closest due date (upcoming first, then undated)
        const sorted = [...validAssignments].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        return {
            upcomingAssignments: sorted,
            totalCount: sorted.length
        };
    }, [currClass?.addedAssignment]);

    const topAssignment = upcomingAssignments[0] || null;
    const remainingCount = totalCount > 1 ? totalCount - 1 : 0;

    const handleAssignmentClick = (assId) => {
        if (currClass?._id && assId) {
            navigate(`/workarea/circle/${currClass._id}/assignment/${assId}`);
        }
    };

    const handleViewAllClick = () => {
        if (currClass?._id) {
            navigate(`/workarea/circle/${currClass._id}/classwork`);
        }
    };

    return (
        <div className="task-summary-container">
            <div className="task-summary-header">
                <h4>Upcoming</h4>
            </div>
            <div className="task-list">
                {!topAssignment ? (
                    <div className="no-task-message">Woohoo, no work due soon!</div>
                ) : (
                    <>
                        <div
                            className="task-item"
                            onClick={() => handleAssignmentClick(topAssignment._id)}
                            title={topAssignment.name || "Assignment"}
                        >
                            <h6>{topAssignment.dueDate ? "DUE" : "ASSIGNMENT"}</h6>
                            <h4>{formatDueDateShort(topAssignment.dueDate)}</h4>
                            <p>{topAssignment.name || "Untitled Assignment"}</p>
                        </div>

                        {remainingCount > 0 ? (
                            <p className="show-more" onClick={handleViewAllClick}>
                                + {remainingCount} more
                            </p>
                        ) : (
                            <p className="show-more" onClick={handleViewAllClick}>
                                View all
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTodoAssignments } from "../../../../Api/apiCaller/todoapicaller";
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import { Assignment as AssignmentIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import "./todo.css";

export default function ToDo() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const loading = useSelector(state => state.loading.loading);
    const [todoData, setTodoData] = useState([]);
    const [activeTab, setActiveTab] = useState("Assigned"); // "Assigned", "Missing", "Done"

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const res = await dispatch(getTodoAssignments()).unwrap();
                if (res && res.data && res.data.byClass) {
                    setTodoData(res.data.byClass);
                }
            } catch (err) {
                console.error("Failed to fetch todos", err);
            }
        };
        fetchTodos();
    }, [dispatch]);

    if (loading) {
        return <LoaderComponent />;
    }

    const renderAssignments = () => {
        if (!todoData || todoData.length === 0) {
            return (
                <div className="empty-todo-state">
                    <CheckCircleIcon style={{ fontSize: 60, color: '#1e8e3e', marginBottom: 16 }} />
                    <h2>Hooray! No work to do.</h2>
                </div>
            );
        }

        let content = [];
        todoData.forEach(classData => {
            let assignments = [];
            if (activeTab === "Assigned") assignments = classData.assigned;
            else if (activeTab === "Missing") assignments = classData.missing;
            else if (activeTab === "Done") assignments = classData.completed;

            if (assignments && assignments.length > 0) {
                content.push(
                    <div key={classData.classId?._id || Math.random()} className="todo-class-section">
                        <h3 className="todo-class-title">{classData.classId?.name || "Class"}</h3>
                        <Divider />
                        {assignments.map(ass => (
                            <div key={ass._id} className="todo-assignment-item" onClick={() => navigate(`/workarea/circle/${classData.classId?._id}/assignment/${ass._id}`)}>
                                <div className="todo-item-left">
                                    <div className={`todo-icon-wrapper ${activeTab === 'Missing' ? 'missing-icon' : ''}`}>
                                        <AssignmentIcon />
                                    </div>
                                    <div className="todo-item-details">
                                        <h4>{ass.name}</h4>
                                        <p>{classData.classId?.className || "No section"} • {ass.category ? "Category Assigned" : "No Category"}</p>
                                    </div>
                                </div>
                                <div className="todo-item-right">
                                    <span className={`todo-due-date ${activeTab === 'Missing' ? 'missing-text' : ''}`}>
                                        {ass.dueDate ? `Due ${new Date(ass.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}` : 'No due date'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
        });

        if (content.length === 0) {
            return (
                <div className="empty-todo-state">
                    <CheckCircleIcon style={{ fontSize: 60, color: '#1e8e3e', marginBottom: 16 }} />
                    <h2>You're all caught up!</h2>
                </div>
            );
        }

        return content;
    };

    return (
        <div className="todo-dashboard-container">
            <div className="todo-header">
                <h1>To-do</h1>
            </div>

            <div className="todo-tabs">
                <div
                    className={`todo-tab ${activeTab === "Assigned" ? "active" : ""}`}
                    onClick={() => setActiveTab("Assigned")}
                >
                    Assigned
                </div>
                <div
                    className={`todo-tab ${activeTab === "Missing" ? "active" : ""}`}
                    onClick={() => setActiveTab("Missing")}
                >
                    Missing
                </div>
                <div
                    className={`todo-tab ${activeTab === "Done" ? "active" : ""}`}
                    onClick={() => setActiveTab("Done")}
                >
                    Done
                </div>
            </div>

            <div className="todo-content-area">
                {renderAssignments()}
            </div>
        </div>
    );
}

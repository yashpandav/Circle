import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getPendingReviews, addIntoReviewed, removeFromReviewed } from "../../../../Api/apiCaller/reviewapicaller";
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import { setLoading } from "../../../../Slices/loadingSlice";
import { Assignment as AssignmentIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import "./review.css";

export default function Review() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const filterAssId = queryParams.get("assId");

    const loading = useSelector(state => state.loading.loading);
    const [reviewData, setReviewData] = useState([]);
    const [activeTab, setActiveTab] = useState("To Review");

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await dispatch(getPendingReviews()).unwrap();
            setReviewData(res);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        }
        setLoading(false);
    }, [dispatch]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleMarkReviewed = async (assId) => {
        await dispatch(addIntoReviewed(assId)).unwrap();
        fetchReviews(); // Refresh data
    };

    const handleMarkPending = async (assId) => {
        await dispatch(removeFromReviewed(assId)).unwrap();
        fetchReviews(); // Refresh data
    };

    if (loading) {
        return <LoaderComponent />;
    }

    const renderAssignments = () => {
        if (!reviewData || reviewData.length === 0) {
            return (
                <div className="empty-state">
                    <CheckCircleIcon style={{ fontSize: 60, color: '#1e8e3e', marginBottom: 16 }} />
                    <h2>Hooray! No work to review.</h2>
                </div>
            );
        }

        let content = [];
        reviewData.forEach(classData => {
            const assignments = activeTab === "To Review" ? classData.notReviedAss : classData.reviewdAss;

            const filteredAssignments = filterAssId
                ? assignments.filter(a => a._id === filterAssId)
                : assignments;

            if (filteredAssignments && filteredAssignments.length > 0) {
                content.push(
                    <div key={classData.classId} className="review-class-section">
                        <h3 className="review-class-title">Assignments</h3>
                        <Divider />
                        {filteredAssignments.map(ass => (
                            <div key={ass._id} className="review-assignment-item">
                                <div className="review-item-left" onClick={() => navigate(`/workarea/circle/${classData.classId}/assignment/${ass._id}`)}>
                                    <div className="review-icon-wrapper">
                                        <AssignmentIcon />
                                    </div>
                                    <div className="review-item-details">
                                        <h4>{ass.name}</h4>
                                        <p>{ass.category ? "Category Assigned" : "No Category"} • Due: {ass.dueDate ? new Date(ass.dueDate).toLocaleDateString() : 'No due date'}</p>
                                    </div>
                                </div>
                                <div className="review-item-right">
                                    <div className="submission-stats">
                                        <div className="stat-block">
                                            <span className="stat-number">{ass.submission ? ass.submission.length : 0}</span>
                                            <span className="stat-label">Turned in</span>
                                        </div>
                                        <div className="stat-block">
                                            <span className="stat-number">{ass.pendingStudent ? ass.pendingStudent.length : 0}</span>
                                            <span className="stat-label">Assigned</span>
                                        </div>
                                    </div>
                                    <div className="review-actions">
                                        {activeTab === "To Review" ? (
                                            <button className="mark-reviewed-btn" onClick={() => handleMarkReviewed(ass._id)}>
                                                Mark as Reviewed
                                            </button>
                                        ) : (
                                            <button className="mark-pending-btn" onClick={() => handleMarkPending(ass._id)}>
                                                Mark as To Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
        });

        if (content.length === 0) {
            return (
                <div className="empty-state">
                    <CheckCircleIcon style={{ fontSize: 60, color: '#1e8e3e', marginBottom: 16 }} />
                    <h2>All caught up!</h2>
                </div>
            );
        }

        return content;
    };

    return (
        <div className="review-dashboard-container">
            <div className="review-header">
                <h1>Review Work</h1>
                {filterAssId && (
                    <button className="clear-filter-btn" onClick={() => navigate('/workarea/review')}>
                        Clear Filter
                    </button>
                )}
            </div>

            <div className="review-tabs">
                <div
                    className={`review-tab ${activeTab === "To Review" ? "active" : ""}`}
                    onClick={() => setActiveTab("To Review")}
                >
                    To Review
                </div>
                <div
                    className={`review-tab ${activeTab === "Reviewed" ? "active" : ""}`}
                    onClick={() => setActiveTab("Reviewed")}
                >
                    Reviewed
                </div>
            </div>

            <div className="review-content-area">
                {renderAssignments()}
            </div>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Assignment as AssignmentIcon } from "@mui/icons-material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import Divider from "@mui/material/Divider";
import { submitAssignment } from '../../../Api/apiCaller/assignmentapicaller';
import { LoaderComponent } from '../../Helper/Loaders/loader';
import { setLoading } from '../../../Slices/loadingSlice';
import './AssignmentDetails.css';

export default function AssignmentDetails() {
    const { id, assignmentId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currClass = useSelector((state) => state.classes.currClass);
    const currUser = useSelector((state) => state.auth.user);
    const loading = useSelector((state) => state.loading.loading);

    const [assignment, setAssignment] = useState(null);
    const [isTeacher, setIsTeacher] = useState(false);

    // For student upload
    const [selectedFile, setSelectedFile] = useState(null);
    const [showOverwriteModal, setShowOverwriteModal] = useState(false);

    useEffect(() => {
        if (currClass && currClass.addedAssignment) {
            const foundAss = currClass.addedAssignment.find(a => a._id === assignmentId);
            if (foundAss) {
                setAssignment(foundAss);
                setIsTeacher(currUser._id === foundAss.teacher._id);
            }
        }
    }, [currClass, assignmentId, currUser]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleTurnIn = async (overwrite = false) => {
        if (!selectedFile) return;

        setLoading(true);
        try {
            await dispatch(submitAssignment({
                assId: assignmentId,
                file: selectedFile,
                overwrite: overwrite,
                onOverwritePrompt: () => {
                    setShowOverwriteModal(true);
                }
            })).unwrap();

            if (overwrite) {
                setShowOverwriteModal(false);
            }
            setSelectedFile(null);
        } catch (err) {
            console.error("Submit assignment error", err);
        }
        setLoading(false);
    };

    if (!assignment) {
        return <LoaderComponent />;
    }

    return (
        <div className="assignment-details-page">
            <div className="assignment-main-content">
                <div className="assignment-header-details">
                    <div className="assignment-icon-wrapper" style={{ backgroundColor: currClass.classTheme }}>
                        <AssignmentIcon fontSize="large" />
                    </div>
                    <div className="assignment-title-area">
                        <h1>{assignment.name}</h1>
                        <div className="assignment-meta-info">
                            {assignment.teacher.firstName} {assignment.teacher.lastName} • {new Date(assignment.uploadDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                        </div>
                        {assignment.dueDate && (
                            <div className="assignment-due-date">
                                Due {new Date(assignment.dueDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="assignment-description-area" dangerouslySetInnerHTML={{ __html: assignment.description }}></div>

                {assignment.file && (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div className="unsupported-files post-side" style={{ margin: 0, padding: '10px', border: '1px solid #e0e0e0', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                            <div className="unsupported-file-first-div" style={{ marginRight: '10px' }}>
                                <PictureAsPdfRoundedIcon style={{ color: '#d93025' }} />
                            </div>
                            <div className="file-preview-name" title={assignment.file}>
                                <a href={assignment.file} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#3c4043', fontWeight: '500' }}>
                                    View Attachment
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="assignment-right-sidebar">
                {isTeacher ? (
                    <div className="teacher-summary-card">
                        <div className="your-work-header">
                            <h2>Student Work</h2>
                        </div>
                        <Divider />
                        <div className="teacher-summary-stats">
                            <div className="stat-item">
                                <h3>{assignment.submission ? assignment.submission.length : 0}</h3>
                                <p>Turned in</p>
                            </div>
                            <div className="stat-item">
                                <h3>{assignment.pendingStudent ? assignment.pendingStudent.length : 0}</h3>
                                <p>Assigned</p>
                            </div>
                        </div>
                        <button className="turn-in-button" onClick={() => navigate(`/workarea/review?assId=${assignment._id}`)}>
                            Review Submissions
                        </button>
                    </div>
                ) : (
                    <div className="your-work-card">
                        <div className="your-work-header">
                            <h2>Your Work</h2>
                            <span className="work-status">Assigned</span>
                        </div>

                        {selectedFile ? (
                            <div className="file-preview-card">
                                <div className="file-preview-details">
                                    <span className="file-preview-name-text">{selectedFile.name}</span>
                                </div>
                                <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#5f6368', fontSize: '16px' }} onClick={() => setSelectedFile(null)}>✕</button>
                            </div>
                        ) : (
                            <label className="upload-work-button">
                                <span>+ Add or create</span>
                                <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                            </label>
                        )}

                        <button
                            className="turn-in-button"
                            disabled={!selectedFile || loading}
                            onClick={() => handleTurnIn(false)}
                        >
                            {loading ? 'Turning in...' : 'Turn in'}
                        </button>
                    </div>
                )}
            </div>

            {/* Overwrite Modal */}
            {showOverwriteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '8px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginTop: 0, fontWeight: 400 }}>Overwrite Submission?</h2>
                        <p style={{ color: '#5f6368', lineHeight: 1.5 }}>You have already submitted an assignment. Do you want to overwrite your previous submission with this new file?</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button className="unsubmit-button" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => setShowOverwriteModal(false)}>Cancel</button>
                            <button className="turn-in-button" style={{ width: 'auto', padding: '8px 16px' }} onClick={() => handleTurnIn(true)}>Overwrite</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

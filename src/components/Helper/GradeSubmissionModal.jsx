import React, { useState, useEffect } from 'react';
import {
    Dialog,
    IconButton,
    CircularProgress,
    Button,
    TextField,
    Avatar,
    InputAdornment
} from '@mui/material';
import {
    Close as CloseIcon,
    RateReviewOutlined as RateReviewIcon,
    CheckCircleRounded as CheckCircleIcon,
    AssignmentReturnRounded as ReturnIcon,
    OpenInNew as OpenInNewIcon,
    AccessTime as AccessTimeIcon,
    ChatBubbleOutlineRounded as ChatIcon,
    InfoOutlined as InfoIcon,
    DescriptionOutlined as DescriptionIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { gradeSubmission } from '../../Api/apiCaller/assignmentapicaller';
import toast from 'react-hot-toast';
import './GradeSubmissionModal.css';

export default function GradeSubmissionModal({
    open,
    onClose,
    assignment,
    submission,
    onGraded,
    themeColor = '#00a896'
}) {
    const dispatch = useDispatch();

    const [status, setStatus] = useState('ACCEPTED'); // 'ACCEPTED' | 'REJECTED'
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const maxMarks = assignment?.totalMarks || submission?.maxMarks || 100;

    useEffect(() => {
        if (submission) {
            setStatus(submission.status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED');
            setMarks(submission.marks !== null && submission.marks !== undefined ? String(submission.marks) : '');
            setFeedback(submission.feedback || '');
        } else {
            setStatus('ACCEPTED');
            setMarks('');
            setFeedback('');
        }
    }, [submission, open]);

    if (!submission || !assignment) return null;

    const student = submission.student;
    const studentName = student
        ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
        : 'Student';
    const studentEmail = student?.email || '';
    const studentImage = student?.image;

    const formattedSubmitDate = submission.submitDate
        ? new Date(submission.submitDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          })
        : 'Recently';

    const handleMarksChange = (e) => {
        const val = e.target.value;
        if (val === '' || (/^\d*\.?\d*$/.test(val) && Number(val) <= maxMarks && Number(val) >= 0)) {
            setMarks(val);
        }
    };

    const handleSubmitGrade = async () => {
        if (status === 'ACCEPTED' && marks === '') {
            toast.error(`Please enter marks out of ${maxMarks}`);
            return;
        }

        if (status === 'ACCEPTED' && (isNaN(Number(marks)) || Number(marks) < 0 || Number(marks) > maxMarks)) {
            toast.error(`Marks must be between 0 and ${maxMarks}`);
            return;
        }

        if (status === 'REJECTED' && !feedback.trim()) {
            toast.error('Please provide a reason or feedback for requesting revision');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                assignmentId: assignment._id || assignment.id,
                submissionId: submission._id || submission.id,
                studentId: student?._id || student?.id || student,
                marks: status === 'ACCEPTED' ? Number(marks) : null,
                maxMarks: maxMarks,
                feedback: feedback.trim(),
                status: status
            };

            const res = await dispatch(gradeSubmission(payload)).unwrap();
            if (res?.success) {
                toast.success(
                    status === 'ACCEPTED'
                        ? `Graded ${studentName}'s submission (${marks}/${maxMarks})`
                        : `Returned ${studentName}'s submission for revision`
                );
                if (onGraded) {
                    onGraded(res.data?.submission || { ...submission, ...payload });
                }
                onClose();
            }
        } catch (err) {
            console.error('Error grading submission:', err);
            const msg = err?.message || 'Failed to submit evaluation';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculatedPercentage = marks !== '' && !isNaN(Number(marks))
        ? Math.round((Number(marks) / maxMarks) * 100)
        : null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            className="grade-submission-dialog"
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                    backgroundColor: '#ffffff',
                    overflow: 'hidden'
                }
            }}
        >
            {/* Modal Header */}
            <div className="grade-modal-header">
                <div className="modal-title-group">
                    <div className="modal-icon-badge" style={{ backgroundColor: themeColor }}>
                        <RateReviewIcon fontSize="small" />
                    </div>
                    <div className="modal-title-text-wrap">
                        <h3>Review & Grade</h3>
                        <span className="modal-subtitle">{assignment.name || 'Assignment'}</span>
                    </div>
                </div>
                <IconButton
                    size="small"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="close-btn"
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>

            {/* Modal Body */}
            <div className="grade-modal-body">
                {/* 1. Student Profile Card */}
                <div className="grade-student-card">
                    <Avatar
                        src={studentImage}
                        alt={studentName}
                        sx={{
                            width: 44,
                            height: 44,
                            bgcolor: themeColor,
                            fontSize: '1.05rem',
                            fontWeight: 600
                        }}
                    >
                        {studentName ? studentName[0] : 'S'}
                    </Avatar>
                    <div className="grade-student-info">
                        <div className="student-name-row">
                            <span className="student-name">{studentName}</span>
                            <span className={`submission-pill ${
                                submission.status === 'ACCEPTED'
                                    ? 'pill-accepted'
                                    : submission.status === 'REJECTED'
                                    ? 'pill-rejected'
                                    : 'pill-submitted'
                            }`}>
                                {submission.status === 'ACCEPTED'
                                    ? 'Graded'
                                    : submission.status === 'REJECTED'
                                    ? 'Needs Revision'
                                    : 'Turned In'}
                            </span>
                        </div>
                        <div className="student-meta-row">
                            {studentEmail && <span className="student-email">{studentEmail}</span>}
                            {studentEmail && <span className="meta-dot">•</span>}
                            <span className="student-time">
                                <AccessTimeIcon fontSize="inherit" />
                                {formattedSubmitDate}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Submitted Work Attachment & Comments */}
                <div className="grade-section-box">
                    <span className="grade-section-title">Submitted Work</span>
                    {submission.file ? (
                        <a
                            href={submission.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="grade-file-attachment"
                        >
                            <div className="file-icon-box">
                                <DescriptionIcon sx={{ color: themeColor }} />
                            </div>
                            <div className="file-text-info">
                                <span className="file-title">
                                    {submission.file.split('/').pop() || 'Student Attachment'}
                                </span>
                                <span className="file-hint">Click to view attached document</span>
                            </div>
                            <OpenInNewIcon fontSize="small" className="file-ext-icon" />
                        </a>
                    ) : (
                        <div className="grade-empty-file">
                            <span>No file attachment submitted</span>
                        </div>
                    )}

                    {/* Student Private Comment */}
                    {submission.data && (
                        <div className="grade-student-comment-box">
                            <div className="comment-box-header">
                                <ChatIcon fontSize="inherit" />
                                <span>Student's Note</span>
                            </div>
                            <p className="comment-box-text">"{submission.data}"</p>
                        </div>
                    )}
                </div>

                {/* 3. Decision Selection */}
                <div className="grade-section-box">
                    <span className="grade-section-title">Evaluation Decision</span>
                    <div className="grade-decision-grid">
                        <button
                            type="button"
                            className={`decision-card ${status === 'ACCEPTED' ? 'active accept-active' : ''}`}
                            onClick={() => setStatus('ACCEPTED')}
                        >
                            <div className="decision-icon-wrap accept-icon">
                                <CheckCircleIcon />
                            </div>
                            <div className="decision-text-wrap">
                                <span className="decision-title">Accept & Grade</span>
                                <span className="decision-sub">Award marks & feedback</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={`decision-card ${status === 'REJECTED' ? 'active reject-active' : ''}`}
                            onClick={() => setStatus('REJECTED')}
                        >
                            <div className="decision-icon-wrap reject-icon">
                                <ReturnIcon />
                            </div>
                            <div className="decision-text-wrap">
                                <span className="decision-title">Return for Revision</span>
                                <span className="decision-sub">Request student to revise</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 4. Score Input (when Accepted) */}
                {status === 'ACCEPTED' ? (
                    <div className="grade-section-box">
                        <span className="grade-section-title">Marks Awarded</span>
                        <div className="grade-score-container">
                            <div className="score-input-wrap">
                                <TextField
                                    type="number"
                                    placeholder="0"
                                    value={marks}
                                    onChange={handleMarksChange}
                                    inputProps={{ min: 0, max: maxMarks, step: 'any' }}
                                    size="small"
                                    className="score-textfield"
                                    autoFocus
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <span className="score-max-adornment">/ {maxMarks} pts</span>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        width: '180px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            fontSize: '1.05rem',
                                            backgroundColor: '#ffffff'
                                        }
                                    }}
                                />
                            </div>
                            {calculatedPercentage !== null && (
                                <div className="score-percentage-badge">
                                    <span>Score: {calculatedPercentage}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grade-rejection-alert">
                        <InfoIcon fontSize="small" sx={{ color: '#e11d48', flexShrink: 0 }} />
                        <span>
                            Returning this submission will notify the student and allow them to revise and resubmit their work before the deadline.
                        </span>
                    </div>
                )}

                {/* 5. Feedback Input */}
                <div className="grade-section-box">
                    <span className="grade-section-title">
                        {status === 'ACCEPTED' ? 'Teacher Feedback (Optional)' : 'Revision Guidance (Required)'}
                    </span>
                    <TextField
                        multiline
                        rows={3}
                        placeholder={
                            status === 'ACCEPTED'
                                ? 'Add constructive feedback, notes, or praise...'
                                : 'Explain what needs correction so the student can revise and improve their work...'
                        }
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                fontSize: '13.5px',
                                backgroundColor: '#ffffff'
                            }
                        }}
                    />
                </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="grade-modal-footer">
                <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="modal-btn-cancel"
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmitGrade}
                    disabled={isSubmitting}
                    startIcon={
                        isSubmitting ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : status === 'ACCEPTED' ? (
                            <CheckCircleIcon fontSize="small" />
                        ) : (
                            <ReturnIcon fontSize="small" />
                        )
                    }
                    className="modal-btn-submit"
                    sx={{
                        backgroundColor: status === 'ACCEPTED' ? themeColor : '#e11d48',
                        '&:hover': {
                            backgroundColor: status === 'ACCEPTED' ? themeColor : '#be123c',
                            filter: 'brightness(0.92)'
                        }
                    }}
                >
                    {isSubmitting
                        ? 'Saving...'
                        : status === 'ACCEPTED'
                        ? 'Save Grade'
                        : 'Return Submission'}
                </Button>
            </div>
        </Dialog>
    );
}


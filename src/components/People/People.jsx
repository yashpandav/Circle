import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import './People.css';
import { Divider } from '@mui/material';

const People = () => {
    const currClass = useSelector((state) => state.classes.currClass);
    const [isLoading] = useState(false);

    // Helper function to get initials
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    // Group users by role
    const teachers = [currClass.admin, ...currClass.teacher];
    const students = currClass.student || [];

    const UserCard = ({ user, role }) => (
        <div className="user-card">
            <div className="user-avatar" style={{ backgroundColor: currClass.classTheme }}>
                {user.image ? (
                    <img src={user.image} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                    <span>{getInitials(user.firstName, user.lastName)}</span>
                )}
            </div>
            <div className="user-info">
                <span className="user-name">{`${user.firstName} ${user.lastName}`}</span>
                {role === 'admin' && <span className="admin-badge">Owner</span>}
            </div>
        </div>
    );

    const EmptyState = ({ role }) => (
        <div className="empty-state">
            {role === 'teacher' ? 
                'No teachers have joined this class yet.' :
                'No students have joined this class yet.'}
        </div>
    );

    return (
        <div className="people-container" role="main">
            <section className="teachers-section" aria-label="Teachers">
                <div className="section-header">
                    <h2>Teachers</h2>
                    <span className="count-badge" role="status">
                        {teachers.length} teachers
                    </span>
                </div>
                <div className="divider" />
                <div className="users-list">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : teachers.length > 0 ? (
                        teachers.map((teacher, index) => (
                            <React.Fragment key={teacher._id}>
                                <UserCard 
                                    user={teacher} 
                                    role={teacher._id === currClass.admin._id ? 'admin' : 'teacher'}
                                />
                                {index < teachers.length - 1 && <Divider />}
                            </React.Fragment>
                        ))
                    ) : (
                        <EmptyState role="teacher" />
                    )}
                </div>
            </section>

            <section className="students-section">
                <div className="section-header">
                    <h2>Classmates</h2>
                    <span className="count-badge">{students.length} students</span>
                </div>
                <div className="divider" />
                <div className="users-list">
                    {students.map((student, index) => (
                        <React.Fragment key={student._id}>
                            <UserCard 
                                user={student} 
                                role="student"
                            />
                            {index < students.length - 1 && <Divider variant="middle"/>}
                        </React.Fragment>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default People
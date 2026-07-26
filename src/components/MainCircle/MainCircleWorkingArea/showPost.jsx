import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import PostContainer from "./postContainer";
import AssignmentContainer from "./assignmentContainer";
import './showPost.css';

export default function ShowPostMain() {
    const currClass = useSelector((state) => state.classes.currClass);
    const currUser = useSelector((state) => state.auth.user);
    const [streamItems, setStreamItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();

    const isAdminOrTeacher = currClass && currUser && (currClass.admin._id === currUser._id || currClass.teacher.some(t => t.id === currUser._id));

    useEffect(() => {
        if (currClass) {
            const posts = currClass.addedPost ? currClass.addedPost.map(p => ({ ...p, itemType: 'post' })) : [];
            const assignments = currClass.addedAssignment ? currClass.addedAssignment.map(a => ({ ...a, itemType: 'assignment' })) : [];
            
            let combined = [...posts, ...assignments].sort((a, b) => {
                return new Date(b.uploadDate) - new Date(a.uploadDate);
            });
            
            const topicId = searchParams.get("topic");
            if (topicId) {
                combined = combined.filter(item => item.category === topicId);
            }
            
            setStreamItems(combined);
            
            // Artificial delay for smooth skeleton loader transition
            setTimeout(() => {
                setIsLoading(false);
            }, 600);
        }
    }, [currClass, searchParams]);
    
    if (isLoading || !currClass) {
        return (
            <div className="stream-skeleton-container">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="post-skeleton">
                        <div className="skeleton-header">
                            <div className="skeleton-avatar"></div>
                            <div className="skeleton-text-group">
                                <div className="skeleton-line short"></div>
                                <div className="skeleton-line date"></div>
                            </div>
                        </div>
                        <div className="skeleton-body">
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line medium"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (streamItems.length === 0) {
        return (
            <div className="empty-stream-container">
                <h4>{isAdminOrTeacher ? "This is where you can talk to your class" : "No posts yet"}</h4>
                <p>
                    {isAdminOrTeacher 
                        ? "Use the stream to share announcements, assignments, and respond to student questions." 
                        : "Your teacher hasn't posted anything to the stream yet."}
                </p>
            </div>
        );
    }

    return (
        streamItems.map((item) => (
            item.itemType === 'post' 
                ? <PostContainer key={`post-${item._id}`} post={item} />
                : <AssignmentContainer key={`assignment-${item._id}`} assignment={item} />
        ))
    );
}
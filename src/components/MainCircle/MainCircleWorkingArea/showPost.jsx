import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import PostContainer from "./postContainer";
import AssignmentContainer from "./assignmentContainer";
import socket from "../../../socket/socket";
import './showPost.css';

export default function ShowPostMain() {
    const currClass = useSelector((state) => state.classes.currClass);
    const currUser = useSelector((state) => state.auth.user);
    const [streamItems, setStreamItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();

    const isAdminOrTeacher = currClass && currUser && (
        currClass.admin._id === currUser._id ||
        currClass.teacher.some(t => t.id === currUser._id)
    );

    // ─── Initial load from Redux (currClass data) ────────────────────────────
    useEffect(() => {
        if (currClass) {
            const posts = currClass.addedPost
                ? currClass.addedPost.map(p => ({ ...p, itemType: 'post' }))
                : [];
            const assignments = currClass.addedAssignment
                ? currClass.addedAssignment.map(a => ({ ...a, itemType: 'assignment' }))
                : [];

            let combined = [...posts, ...assignments].sort((a, b) =>
                new Date(b.uploadDate) - new Date(a.uploadDate)
            );

            const topicId = searchParams.get("topic");
            if (topicId) {
                combined = combined.filter(item => item.category === topicId);
            }

            setStreamItems(combined);
            setTimeout(() => setIsLoading(false), 600);
        }
    }, [currClass, searchParams]);

    const handleNewPost = useCallback(({ data }) => {
        const newItem = { ...data, itemType: 'post' };
        setStreamItems(prev => [newItem, ...prev]);
    }, []);

    const handlePostDeleted = useCallback(({ postId }) => {
        setStreamItems(prev => prev.filter(item => item._id !== postId));
    }, []);

    const handlePostUpdated = useCallback(({ data }) => {
        setStreamItems(prev => prev.map(item =>
            item._id === data._id ? { ...data, itemType: 'post' } : item
        ));
    }, []);

    const handleNewAssignment = useCallback(({ data }) => {
        const newItem = { ...data, itemType: 'assignment' };
        setStreamItems(prev => [newItem, ...prev]);
    }, []);

    const handleAssignmentDeleted = useCallback(({ assignmentId }) => {
        setStreamItems(prev => prev.filter(item => item._id !== assignmentId));
    }, []);

    const handleAssignmentUpdated = useCallback(({ data }) => {
        setStreamItems(prev => prev.map(item =>
            item._id === data._id ? { ...data, itemType: 'assignment' } : item
        ));
    }, []);

    useEffect(() => {
        socket.on('post:new', handleNewPost);
        socket.on('post:deleted', handlePostDeleted);
        socket.on('post:updated', handlePostUpdated);
        socket.on('assignment:new', handleNewAssignment);
        socket.on('assignment:deleted', handleAssignmentDeleted);
        socket.on('assignment:updated', handleAssignmentUpdated);

        return () => {
            socket.off('post:new', handleNewPost);
            socket.off('post:deleted', handlePostDeleted);
            socket.off('post:updated', handlePostUpdated);
            socket.off('assignment:new', handleNewAssignment);
            socket.off('assignment:deleted', handleAssignmentDeleted);
            socket.off('assignment:updated', handleAssignmentUpdated);
        };
    }, [
        handleNewPost, handlePostDeleted, handlePostUpdated,
        handleNewAssignment, handleAssignmentDeleted, handleAssignmentUpdated
    ]);


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
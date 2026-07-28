import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import socket from './socket';
import { updateCurrClass, setCurrClass, addClassMember, removeClassMember } from '../Slices/classSlice';

/**
 * SocketProvider — sits inside the app tree and manages the socket lifecycle.
 * 
 * Responsibilities:
 *  1. Connect socket when the user is logged in, disconnect on logout.
 *  2. Join/leave classroom Socket.IO rooms as the current class changes.
 *  3. Register all real-time event listeners and dispatch Redux actions.
 */
export default function SocketProvider({ children }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);

    // ─── 1. Connect / Disconnect based on auth state ─────────────────────────
    useEffect(() => {
        if (user) {
            if (!socket.connected) {
                socket.connect();
                console.log('[Socket] Connected');
            }
        } else {
            if (socket.connected) {
                socket.disconnect();
                console.log('[Socket] Disconnected');
            }
        }
    }, [user]);

    // ─── 2. Join / Leave classroom room ──────────────────────────────────────
    useEffect(() => {
        if (!currClass?._id) return;
        const roomId = currClass._id;

        socket.emit('join:room', roomId);
        console.log(`[Socket] Joined room: ${roomId}`);

        return () => {
            socket.emit('leave:room', roomId);
            console.log(`[Socket] Left room: ${roomId}`);
        };
    }, [currClass?._id]);

    // ─── 3. Register all real-time event listeners ────────────────────────────
    const handleClassUpdated = useCallback(({ data }) => {
        // Merge updated fields into the current class in Redux
        dispatch(updateCurrClass(data));
    }, [dispatch]);

    const handleClassDeleted = useCallback(() => {
        // Clear the current class and redirect all members to home
        dispatch(setCurrClass(null));
        navigate('/workarea/home');
    }, [dispatch, navigate]);

    const handleMemberLeft = useCallback(({ userId }) => {
        dispatch(removeClassMember({ userId }));
    }, [dispatch]);

    const handleCodeReset = useCallback(({ entryCode }) => {
        dispatch(updateCurrClass({ entryCode }));
    }, [dispatch]);

    const handleCodeToggled = useCallback(({ isCodeActive }) => {
        dispatch(updateCurrClass({ isCodeActive }));
    }, [dispatch]);

    const handleTeacherAdded = useCallback(({ user }) => {
        dispatch(addClassMember({ type: 'teacher', user }));
    }, [dispatch]);

    const handleMemberJoined = useCallback(({ user }) => {
        dispatch(addClassMember({ type: 'student', user }));
    }, [dispatch]);

    useEffect(() => {
        // Class events
        socket.on('class:updated', handleClassUpdated);
        socket.on('class:deleted', handleClassDeleted);
        socket.on('class:member_left', handleMemberLeft);
        socket.on('class:code_reset', handleCodeReset);
        socket.on('class:code_toggled', handleCodeToggled);
        socket.on('class:teacher_added', handleTeacherAdded);
        socket.on('class:member_joined', handleMemberJoined);

        return () => {
            socket.off('class:updated', handleClassUpdated);
            socket.off('class:deleted', handleClassDeleted);
            socket.off('class:member_left', handleMemberLeft);
            socket.off('class:code_reset', handleCodeReset);
            socket.off('class:code_toggled', handleCodeToggled);
            socket.off('class:teacher_added', handleTeacherAdded);
            socket.off('class:member_joined', handleMemberJoined);
        };
    }, [
        handleClassUpdated, handleClassDeleted, handleMemberLeft,
        handleCodeReset, handleCodeToggled, handleTeacherAdded, handleMemberJoined
    ]);

    return children;
}

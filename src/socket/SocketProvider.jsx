import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import socket from './socket';
import {
    updateCurrClass,
    setCurrClass,
    removeClass,
    addClassMember,
    removeClassMember,
    updateClassMember,
    addCategory,
    removeCategory,
    updateCategory
} from '../Slices/classSlice';

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

    // ─── 1. Connect / Disconnect & User Room based on auth state ────────────
    useEffect(() => {
        if (user) {
            if (!socket.connected) socket.connect();
            const userId = user._id || user.id;
            if (userId) {
                socket.emit('join:user', userId);
            }
        } else {
            if (socket.connected) socket.disconnect();
        }

        return () => {
            if (user) {
                const userId = user._id || user.id;
                if (userId) {
                    socket.emit('leave:user', userId);
                }
            }
        };
    }, [user]);

    // ─── 2. Join / Leave classroom room ──────────────────────────────────────
    useEffect(() => {
        if (!currClass?._id) return;
        const roomId = currClass._id;

        socket.emit('join:room', roomId);

        return () => {
            socket.emit('leave:room', roomId);
        };
    }, [currClass?._id]);

    // ─── 3. Register all real-time event listeners ────────────────────────────
    const handleClassUpdated = useCallback(({ data }) => {
        // Merge updated fields into the current class in Redux
        dispatch(updateCurrClass(data));
    }, [dispatch]);

    const handleClassDeleted = useCallback((payload) => {
        const deletedClassId = payload?.classId || payload?.data?.classId || payload?.id;

        // Remove class globally from all Redux state lists (Home cards, Left sidebar, etc.)
        if (deletedClassId) {
            dispatch(removeClass(deletedClassId));
        }

        // If user is currently viewing this deleted circle, clear currClass and redirect to home
        if (!deletedClassId || !currClass?._id || currClass._id.toString() === deletedClassId.toString()) {
            dispatch(setCurrClass(null));
            navigate('/workarea/home');
        }
    }, [dispatch, navigate, currClass?._id]);

    const handleMemberLeft = useCallback(({ userId, classId }) => {
        if (userId === (user?._id || user?.id) && classId) {
            dispatch(removeClass(classId));
        } else {
            dispatch(removeClassMember({ userId }));
        }
    }, [dispatch, user]);

    const handleMemberUpdated = useCallback(({ user: memberUser }) => {
        dispatch(updateClassMember({ user: memberUser }));
    }, [dispatch]);

    const handleCodeReset = useCallback(({ entryCode }) => {
        dispatch(updateCurrClass({ entryCode }));
    }, [dispatch]);

    const handleCodeToggled = useCallback(({ isCodeActive }) => {
        dispatch(updateCurrClass({ isCodeActive }));
    }, [dispatch]);

    const handleTeacherAdded = useCallback(({ user: teacherUser }) => {
        dispatch(addClassMember({ type: 'teacher', user: teacherUser }));
    }, [dispatch]);

    const handleMemberJoined = useCallback(({ user: joinedUser }) => {
        dispatch(addClassMember({ type: 'student', user: joinedUser }));
    }, [dispatch]);

    const handleCategoryCreated = useCallback(({ data }) => {
        dispatch(addCategory(data));
    }, [dispatch]);

    const handleCategoryDeleted = useCallback(({ categoryId }) => {
        dispatch(removeCategory(categoryId));
    }, [dispatch]);

    const handleCategoryUpdated = useCallback(({ data }) => {
        dispatch(updateCategory(data));
    }, [dispatch]);

    useEffect(() => {
        // Class events
        socket.on('class:updated', handleClassUpdated);
        socket.on('class:deleted', handleClassDeleted);
        socket.on('class:member_left', handleMemberLeft);
        socket.on('class:member_updated', handleMemberUpdated);
        socket.on('class:code_reset', handleCodeReset);
        socket.on('class:code_toggled', handleCodeToggled);
        socket.on('class:teacher_added', handleTeacherAdded);
        socket.on('class:member_joined', handleMemberJoined);

        // Category events
        socket.on('category:created', handleCategoryCreated);
        socket.on('category:deleted', handleCategoryDeleted);
        socket.on('category:updated', handleCategoryUpdated);

        return () => {
            socket.off('class:updated', handleClassUpdated);
            socket.off('class:deleted', handleClassDeleted);
            socket.off('class:member_left', handleMemberLeft);
            socket.off('class:member_updated', handleMemberUpdated);
            socket.off('class:code_reset', handleCodeReset);
            socket.off('class:code_toggled', handleCodeToggled);
            socket.off('class:teacher_added', handleTeacherAdded);
            socket.off('class:member_joined', handleMemberJoined);

            socket.off('category:created', handleCategoryCreated);
            socket.off('category:deleted', handleCategoryDeleted);
            socket.off('category:updated', handleCategoryUpdated);
        };
    }, [
        handleClassUpdated, handleClassDeleted, handleMemberLeft, handleMemberUpdated,
        handleCodeReset, handleCodeToggled, handleTeacherAdded, handleMemberJoined,
        handleCategoryCreated, handleCategoryDeleted, handleCategoryUpdated
    ]);

    return children;
}

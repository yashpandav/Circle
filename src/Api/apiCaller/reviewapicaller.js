import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../apiconfig';
import { REVIEWS_API_URL } from '../apis';
import toast from 'react-hot-toast';

export const getPendingReviews = createAsyncThunk(
    'getPendingReviews',
    async (classId = '') => {
        try {
            const url = classId ? `${REVIEWS_API_URL}/${classId}` : `${REVIEWS_API_URL}/all`;
            const response = await apiConnector('POST', url);
            return response.data;
        } catch (err) {
            toast.error("Failed to load reviews");
            return err.response ? err.response.data : err.message;
        }
    }
);

export const addIntoReviewed = createAsyncThunk(
    'addIntoReviewed',
    async (assignmentId) => {
        try {
            const response = await apiConnector('POST', `${REVIEWS_API_URL}/add`, { addId: assignmentId });
            toast.success("Marked as reviewed");
            return response.data;
        } catch (err) {
            toast.error("Failed to mark as reviewed");
            return err.response ? err.response.data : err.message;
        }
    }
);

export const removeFromReviewed = createAsyncThunk(
    'removeFromReviewed',
    async (assignmentId) => {
        try {
            const response = await apiConnector('POST', `${REVIEWS_API_URL}/remove`, { assId: assignmentId });
            toast.success("Removed from reviewed");
            return response.data;
        } catch (err) {
            toast.error("Failed to remove from reviewed");
            return err.response ? err.response.data : err.message;
        }
    }
);

import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../apiconfig';
import { REVIEWS_API_URL } from '../apis';
import {
    setReviewData,
    setLoading,
    setIsRefreshing,
    setError,
    optimisticMarkReviewed,
    optimisticMarkPending
} from '../../Slices/reviewSlice';
import toast from 'react-hot-toast';

export const getPendingReviews = createAsyncThunk(
    'getPendingReviews',
    async (params = { classId: 'all', isSilent: false }, { dispatch, rejectWithValue }) => {
        const classId = typeof params === 'string' ? params : (params?.classId || 'all');
        const isSilent = typeof params === 'object' ? Boolean(params?.isSilent) : false;

        if (isSilent) {
            dispatch(setIsRefreshing(true));
        } else {
            dispatch(setLoading(true));
        }

        try {
            const url = classId && classId !== 'all' ? `${REVIEWS_API_URL}/${classId}` : `${REVIEWS_API_URL}/all`;
            const response = await apiConnector('POST', url);
            const rawData = response?.data?.data !== undefined ? response?.data?.data : (response?.data || []);
            const reviewList = Array.isArray(rawData) ? rawData : [];

            dispatch(setReviewData(reviewList));
            dispatch(setError(null));
            return reviewList;
        } catch (err) {
            const errMsg = err?.response?.data?.message || err?.message || "Failed to load Review assignments";
            dispatch(setError(errMsg));
            if (!isSilent) {
                toast.error(errMsg);
            }
            return rejectWithValue(err.response ? err.response.data : err.message);
        } finally {
            if (isSilent) {
                dispatch(setIsRefreshing(false));
            } else {
                dispatch(setLoading(false));
            }
        }
    }
);

export const addIntoReviewed = createAsyncThunk(
    'addIntoReviewed',
    async (assignmentId, { dispatch, rejectWithValue }) => {
        const assIdStr = assignmentId?.toString();
        // Optimistic UI update
        if (assIdStr) {
            dispatch(optimisticMarkReviewed(assIdStr));
        }

        try {
            const response = await apiConnector('POST', `${REVIEWS_API_URL}/add`, {
                assId: assIdStr,
                addId: assIdStr,
                assignmentId: assIdStr
            });
            toast.success("Assignment marked as reviewed", { id: `review-toast-${assIdStr}` });
            return response.data;
        } catch (err) {
            // Revert optimistic update
            if (assIdStr) {
                dispatch(optimisticMarkPending(assIdStr));
            }
            const errMsg = err?.response?.data?.message || "Failed to mark assignment as reviewed";
            toast.error(errMsg, { id: `review-toast-${assIdStr}` });
            return rejectWithValue(err.response ? err.response.data : err.message);
        }
    }
);

export const removeFromReviewed = createAsyncThunk(
    'removeFromReviewed',
    async (assignmentId, { dispatch, rejectWithValue }) => {
        const assIdStr = assignmentId?.toString();
        // Optimistic UI update
        if (assIdStr) {
            dispatch(optimisticMarkPending(assIdStr));
        }

        try {
            const response = await apiConnector('POST', `${REVIEWS_API_URL}/remove`, {
                assId: assIdStr,
                addId: assIdStr,
                assignmentId: assIdStr
            });
            toast.success("Moved back to To-Review", { id: `review-toast-${assIdStr}` });
            return response.data;
        } catch (err) {
            // Revert optimistic update
            if (assIdStr) {
                dispatch(optimisticMarkReviewed(assIdStr));
            }
            const errMsg = err?.response?.data?.message || "Failed to move assignment to To-Review";
            toast.error(errMsg, { id: `review-toast-${assIdStr}` });
            return rejectWithValue(err.response ? err.response.data : err.message);
        }
    }
);

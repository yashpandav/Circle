import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../apiconfig';
import { TODOS_API_URL } from '../apis';
import { setTodoData, setLoading, setIsRefreshing, setError } from '../../Slices/todoSlice';
import toast from 'react-hot-toast';

export const getTodoAssignments = createAsyncThunk(
    'getTodoAssignments',
    async (params = { classId: 'all', isSilent: false }, { dispatch, rejectWithValue }) => {
        const classId = typeof params === 'string' ? params : (params?.classId || 'all');
        const isSilent = typeof params === 'object' ? Boolean(params?.isSilent) : false;

        if (isSilent) {
            dispatch(setIsRefreshing(true));
        } else {
            dispatch(setLoading(true));
        }

        try {
            const url = `${TODOS_API_URL}/${classId}`;
            const response = await apiConnector('POST', url);
            const data = response?.data?.data || response?.data || {};
            const byClass = data.byClass || [];

            dispatch(setTodoData(byClass));
            dispatch(setError(null));
            return response.data;
        } catch (err) {
            const errMsg = err?.response?.data?.message || err?.message || "Failed to load To-Do list";
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

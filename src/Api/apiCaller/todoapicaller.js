import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../apiconfig';
import { TODOS_API_URL } from '../apis';
import toast from 'react-hot-toast';

export const getTodoAssignments = createAsyncThunk(
    'getTodoAssignments',
    async (classId = 'all', { rejectWithValue }) => {
        try {
            const url = `${TODOS_API_URL}/${classId}`;
            const response = await apiConnector('POST', url);
            return response.data;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to load To-Do list");
            return rejectWithValue(err.response ? err.response.data : err.message);
        }
    }
);

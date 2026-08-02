import { POST_API_URL } from '../apis.js';
import { apiConnector } from '../apiconfig.js';
import toast from 'react-hot-toast';
import { createAsyncThunk } from '@reduxjs/toolkit';

const {
    CREATE_POST_API,
    DELETE_POST_API,
    EDIT_POST_API
} = POST_API_URL;

export const createPost = createAsyncThunk(
    'createPost',
    async (data, { rejectWithValue }) => {
        try {
            const response = await apiConnector('POST', CREATE_POST_API, data);
            toast.success('Post created successfully!');
            return response.data;
        } catch (err) {
            console.error("Error During Creating Post ", err);
            const msg = err?.response?.data?.message || "Something went wrong while creating post";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const deletePost = createAsyncThunk(
    'deletePost',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await apiConnector('DELETE', `${DELETE_POST_API}/${postId}`);
            toast.success('Post deleted successfully!');
            return response.data;
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to delete post";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const editPost = createAsyncThunk(
    'editPost',
    async ({ postId, data }, { rejectWithValue }) => {
        try {
            const response = await apiConnector('PUT', `${EDIT_POST_API}/${postId}`, data);
            toast.success('Post updated successfully!');
            return response.data;
        } catch (err) {
            console.error("Error During Editing Post ", err);
            const msg = err?.response?.data?.message || "Failed to edit post";
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);
import {POST_API_URL} from '../apis.js';
import {apiConnector} from '../apiconfig.js';
import toast from 'react-hot-toast';

const {
    CREATE_POST_API,
    DELETE_POST_API,
    EDIT_POST_API
} = POST_API_URL;

import { createAsyncThunk } from '@reduxjs/toolkit';

export const createPost = createAsyncThunk(
    'createPost',
    async (data) => {
        try {
            console.log("DATA ", data);
            const response = await apiConnector('POST', CREATE_POST_API, data);
            console.log("API RESPONSE ", response);
            toast.success('Post created successfully!');
            return response.data;
        } catch (err) {
            console.log("Error During Creating Post ", err);
            toast.error('Something Went Wrong While Creating Post');
            return err.response ? err.response : err.message;
        }
    }
);

export const deletePost = createAsyncThunk(
    'deletePost',
    async (postId) => {
        try {
            const response = await apiConnector('DELETE', `${DELETE_POST_API}/${postId}`);
            toast.success('Post deleted successfully!');
            return response.data;
        } catch (err) {
            toast.error('Failed to delete post');
            return err.response ? err.response : err.message;
        }
    }
);

export const editPost = createAsyncThunk(
    'editPost',
    async ({ postId, data }) => {
        try {
            const response = await apiConnector('PUT', `${EDIT_POST_API}/${postId}`, data);
            toast.success('Post edited successfully!');
            return response.data;
        } catch (err) {
            toast.error('Failed to edit post');
            return err.response ? err.response : err.message;
        }
    }
);
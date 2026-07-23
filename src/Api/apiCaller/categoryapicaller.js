import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../apiconfig';
import { CATEGORY_API_URL } from '../apis';
import toast from 'react-hot-toast';

const {
    CREATE_CATEGORY_API,
    DELETE_category_API,
    GET_CATEGORY_API,
    EDIT_CATEGORY_API
} = CATEGORY_API_URL;

export const createCategory = createAsyncThunk(
    'createCategory',
    async ({ name, classId }) => {
        try {
            const response = await apiConnector('POST', CREATE_CATEGORY_API, { name, classId });
            toast.success("Topic created successfully");
            return response.data;
        } catch (err) {
            toast.error("Failed to create topic");
            return err.response ? err.response.data : err.message;
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'deleteCategory',
    async ({ id, classId }) => {
        try {
            const response = await apiConnector('DELETE', `${DELETE_category_API}/${id}`, { classId });
            toast.success("Topic deleted");
            return response.data;
        } catch (err) {
            toast.error("Failed to delete topic");
            return err.response ? err.response.data : err.message;
        }
    }
);

export const editCategory = createAsyncThunk(
    'editCategory',
    async ({ categoryId, name, classId }) => {
        try {
            const response = await apiConnector('PUT', EDIT_CATEGORY_API, { categoryId, name, classId });
            toast.success("Topic edited successfully");
            return response.data;
        } catch (err) {
            toast.error("Failed to edit topic");
            return err.response ? err.response.data : err.message;
        }
    }
);

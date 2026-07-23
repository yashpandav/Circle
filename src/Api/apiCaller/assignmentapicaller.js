import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../apiconfig';
import { ASSIGNMENT_API_URL } from '../apis';
import toast from 'react-hot-toast';

const {
    CREATE_ASSIGNMENT_API,
    EDIT_ASSIGNMENT_API,
    GET_ASSIGNMENT_API,
    DELETE_ASSIGNMENT_API,
    SUBMIT_ASSIGNMENT_API,
    DELETED_SUBMITTED_ASSIGNMENT_API,
    EDITED_SUBMITTED_ASSIGNMENT_API
} = ASSIGNMENT_API_URL;

export const createAssignment = createAsyncThunk(
    'createAssignment',
    async (assignmentData) => {
        try {
            const response = await apiConnector('POST', CREATE_ASSIGNMENT_API, assignmentData);
            toast.success("Assignment Created Successfully");
            return response.data;
        } catch (err) {
            toast.error("Failed to Create Assignment");
            return err.response ? err.response : err.message;
        }
    }
);

export const editAssignment = createAsyncThunk(
    'editAssignment',
    async ({ assId, assignmentData }) => {
        try {
            const response = await apiConnector('PUT', `${EDIT_ASSIGNMENT_API}/${assId}`, assignmentData);
            toast.success("Assignment Edited Successfully");
            return response.data;
        } catch (err) {
            toast.error("Failed to Edit Assignment");
            return err.response ? err.response : err.message;
        }
    }
);

export const getAssignmentDetails = createAsyncThunk(
    'getAssignmentDetails',
    async (assId) => {
        try {
            const response = await apiConnector('GET', `${GET_ASSIGNMENT_API}/${assId}`);
            return response.data;
        } catch (err) {
            toast.error("Failed to Get Assignment Details");
            return err.response ? err.response : err.message;
        }
    }
);

export const deleteAssignment = createAsyncThunk(
    'deleteAssignment',
    async (assId) => {
        try {
            const response = await apiConnector('DELETE', `${DELETE_ASSIGNMENT_API}/${assId}`);
            toast.success("Assignment Deleted Successfully");
            return response.data;
        } catch (err) {
            toast.error("Failed to Delete Assignment");
            return err.response ? err.response : err.message;
        }
    }
);

export const submitAssignment = createAsyncThunk(
    'submitAssignment',
    async ({ assId, data, submittedID, file, overwrite, onOverwritePrompt }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            if (data) formData.append('data', data);
            if (submittedID) formData.append('submittedID', submittedID);
            if (file) formData.append('file', file);
            if (overwrite !== undefined) formData.append('overwrite', overwrite);

            const response = await apiConnector('POST', `${SUBMIT_ASSIGNMENT_API}/${assId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            toast.success("Assignment Submitted Successfully");
            return response.data;
        } catch (err) {
            if (err.response?.status === 409 && err.response?.data?.overwriteRequired) {
                if (onOverwritePrompt) {
                    onOverwritePrompt();
                }
                return rejectWithValue('overwrite_required');
            }
            toast.error("Failed to Submit Assignment");
            return rejectWithValue(err.response ? err.response.data : err.message);
        }
    }
);

export const editSubmittedAssignment = createAsyncThunk(
    'editSubmittedAssignment',
    async ({ assId, data, submittedID, file, overwrite, onOverwritePrompt }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            if (data) formData.append('data', data);
            if (submittedID) formData.append('submittedID', submittedID);
            if (file) formData.append('file', file);
            if (overwrite !== undefined) formData.append('overwrite', overwrite);

            const response = await apiConnector('PUT', `${EDITED_SUBMITTED_ASSIGNMENT_API}/${assId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            toast.success("Assignment Submission Edited Successfully");
            return response.data;
        } catch (err) {
            if (err.response?.status === 409 && err.response?.data?.overwriteRequired) {
                if (onOverwritePrompt) {
                    onOverwritePrompt();
                }
                return rejectWithValue('overwrite_required');
            }
            toast.error("Failed to Edit Submission");
            return rejectWithValue(err.response ? err.response.data : err.message);
        }
    }
);

export const deleteSubmittedAssignment = createAsyncThunk(
    'deleteSubmittedAssignment',
    async ({ assId, submittedID }) => {
        try {
            const response = await apiConnector('DELETE', DELETED_SUBMITTED_ASSIGNMENT_API, { assId, submittedID });
            toast.success("Assignment Submission Deleted Successfully");
            return response.data;
        } catch (err) {
            toast.error("Failed to Delete Submission");
            return err.response ? err.response : err.message;
        }
    }
);

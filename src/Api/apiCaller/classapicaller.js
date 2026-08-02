import { CLASS_API_URL } from '../apis';
import { apiConnector } from '../apiconfig';
import toast from 'react-hot-toast';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setCurrClass } from '../../Slices/classSlice';

const {
    CREATE_CLASS_API,
    JOIN_CLASS_API,
    GET_CLASS_API,
    GET_ALL_CLASS_API,
    DELETE_CLASS_API,
    UPDATE_CLASS_API,
    LEFT_CLASS_API,
    CHANGE_ENTRY_CODE,
    TOGGLE_ENTRY_CODE,
    ADD_TEACHER_API
} = CLASS_API_URL;

export const fetchAllClasses = async () => {
    try {
        const response = await apiConnector('GET', GET_ALL_CLASS_API);
        if (!response || !response.data.success) {
            throw new Error('Failed to fetch classes');
        }
        return response.data;
    } catch (err) {
        throw err;
    }
};

export const createClass = async ({ data }) => {
    try {
        let { banner } = data;
        data = { ...data, banner: banner[0] };
        await apiConnector('POST', CREATE_CLASS_API, data, {
            "Content-Type": "multipart/form-data",
        });
        toast.success('Successfully created new Circle');
        return true;
    } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to create Circle");
        return false;
    }
};

export const joinClass = async (data) => {
    try {
        await apiConnector('POST', JOIN_CLASS_API, data);
        toast.success('Successfully Joined Circle');
        return true;
    } catch (err) {
        if (err.response?.status === 404) {
            toast.error(err?.response?.data?.message || "Circle Not Found");
        } else if (err.response?.status === 400) {
            toast.error('You are already enrolled in this Circle');
        } else if (err.response?.status === 403) {
            toast.error('Invitations for this class have been turned off by the admin.');
        } else {
            toast.error('Failed to join circle');
        }
        return false;
    }
};

export const getClass = createAsyncThunk(
    'getClass',
    async ({ id, dispatch, navigate }) => {
        try {
            const response = await apiConnector('GET', `${GET_CLASS_API}/${id}`);
            dispatch(setCurrClass(response.data.data));
            if (navigate) {
                navigate(`/workarea/circle/${response.data.data._id}`);
            }
            return response.data;
        } catch (err) {
            return err.response ? err.response : err.message;
        }
    }
);

export const changeEntryCode = createAsyncThunk(
    'changeEntryCode',
    async ({ id, dispatch }) => {
        try {
            const response = await apiConnector('POST', `${CHANGE_ENTRY_CODE}/${id}`);
            dispatch(setCurrClass(response.data.data));
            return response.data;
        } catch (err) {
            return err.response ? err.response : err.message;
        }
    }
);

export const toggleEntryCodeStatus = createAsyncThunk(
    'toggleEntryCodeStatus',
    async ({ id, dispatch }) => {
        try {
            const response = await apiConnector('POST', `${TOGGLE_ENTRY_CODE}/${id}`);
            dispatch(setCurrClass(response.data.data));
            toast.success(response.data.message);
            return response.data;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to toggle invitations");
            return err.response ? err.response : err.message;
        }
    }
);

export const updateClassDetails = createAsyncThunk(
    'updateClass',
    async ({ id, data, dispatch }) => {
        try {
            const response = await apiConnector('POST', `${UPDATE_CLASS_API}/${id}`, data);
            await dispatch(getClass({ id, dispatch })).unwrap();
            toast.success("Circle updated successfully");
            return response.data;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update Circle");
            return err.response ? err.response : err.message;
        }
    }
);

export const addTeacherToClass = createAsyncThunk(
    'addTeacherToClass',
    async ({ classId, email, dispatch }) => {
        try {
            const response = await apiConnector('POST', ADD_TEACHER_API, { classId, email });
            await dispatch(getClass({ id: classId, dispatch })).unwrap();
            toast.success(response.data.message);
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add teacher");
            return false;
        }
    }
);

export const deleteClassAction = createAsyncThunk(
    'deleteClass',
    async ({ id, navigate }) => {
        try {
            const response = await apiConnector('DELETE', `${DELETE_CLASS_API}/${id}`);
            toast.success("Class deleted successfully");
            navigate('/workarea/home');
            return response.data;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to delete class");
            return err.response ? err.response.data : err.message;
        }
    }
);

export const leaveClassAction = createAsyncThunk(
    'leaveClass',
    async ({ classId, navigate }) => {
        try {
            const response = await apiConnector('POST', LEFT_CLASS_API, { classId });
            toast.success("Left class successfully");
            navigate('/workarea/home');
            return response.data;
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to leave class");
            return err.response ? err.response.data : err.message;
        }
    }
);

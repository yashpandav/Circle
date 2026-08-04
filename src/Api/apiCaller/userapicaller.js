import { apiConnector } from '../apiconfig.js';
import { PROFILE_API_URL } from '../apis.js';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setJoinedClassTeacher, setJoinedClassStudent, setCreatedClass } from '../../Slices/classSlice.js';
import { setUser } from '../../Slices/authSlice.js';

const { GET_USER_JOINED_API, GET_USER_DASHBOARD_API, UPDATE_USER_API } = PROFILE_API_URL;

export const joinedClass = createAsyncThunk(
    'class/joinedClass',
    async (arg, { dispatch, rejectWithValue }) => {
        try {
            const thunkDispatch = dispatch || arg?.dispatch;
            const response = await apiConnector('GET', GET_USER_JOINED_API);
            const data = response?.data?.data;
            if (!data) throw new Error('Invalid response structure');

            if (thunkDispatch) {
                thunkDispatch(setJoinedClassTeacher(data.joinedClassAsAteacher || []));
                thunkDispatch(setJoinedClassStudent(data.joinedClassAsStudent || []));
                thunkDispatch(setCreatedClass(data.createdClasses || []));
            }

            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getUserDashboard = async () => {
    try {
        const response = await apiConnector('GET', GET_USER_DASHBOARD_API);
        return response?.data;
    } catch (err) {
        throw err?.response?.data || err;
    }
};

export const updateUserProfile = async (formData, dispatch) => {
    try {
        const response = await apiConnector('PUT', UPDATE_USER_API, formData, {
            'Content-Type': 'multipart/form-data',
        });
        if (response?.data?.data && dispatch) {
            dispatch(setUser(response.data.data));
        }
        return response?.data;
    } catch (err) {
        throw err?.response?.data || err;
    }
};


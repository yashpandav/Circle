import { apiConnector } from '../apiconfig.js';
import { PROFILE_API_URL } from '../apis.js';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setJoinedClassTeacher, setJoinedClassStudent, setCreatedClass } from '../../Slices/classSlice.js';

const { GET_USER_JOINED_API } = PROFILE_API_URL;

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

import { apiConnector } from '../apiconfig.js';
import { PROFILE_API_URL } from '../apis.js';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setJoinedClassTeacher ,setJoinedClassStudent , setCreatedClass} from '../../Slices/classSlice.js'
import { setLoading } from '../../Slices/loadingSlice.js';
const {
    // GET_USER_DETAILS_API,
    GET_USER_JOINED_API,
    GET_USER_CREATED_API,
    // DELETE_USER_API,
    // UPDATE_USER_API,
    TOTAL_USER_API
} = PROFILE_API_URL;

export const joinedClass = createAsyncThunk(
    'class/joinedClass',
    async ({dispatch}) => {
        try {
            dispatch(setLoading(true));
            const response = await apiConnector('GET', GET_USER_JOINED_API);
            dispatch(setJoinedClassTeacher(response.data.data.joinedClassAsAteacher));
            dispatch(setJoinedClassStudent(response.data.data.joinedClassAsStudent));
            dispatch(setCreatedClass(response.data.data.createdClasses));
            dispatch(setLoading(false));
            return response.data;
        } catch (err) {
            console.log("ERROR DURING FETCHING USER JOINED API =>", err);
            return err.response ? err.response : err.message;
        }
    }
);

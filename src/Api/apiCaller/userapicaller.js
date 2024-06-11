import { apiConnector } from '../apiconfig.js';
import { PROFILE_API_URL } from '../apis.js';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setJoinedClass } from '../../Slices/classSlice.js'
import { setLoading } from '../../Slices/classSlice.js';

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
    async (dispatch) => {
        try {
            dispatch(setLoading(true));
            const response = await apiConnector('GET', GET_USER_JOINED_API);
            const join = {
                joinedAsTeacher: response.data.data.joinedClassAsAteacher,
                joinedAsAteacher: response.data.data.joinedClassAsStudent
            }
            dispatch(setJoinedClass(join));
            return response.data;
        } catch (err) {
            console.log("ERROR DURING FETCHING USER JOINED API =>", err);
            return err.response ? err.response : err.message;
        }
    }
);

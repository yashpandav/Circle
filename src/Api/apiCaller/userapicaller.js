import {apiConnector} from '../apiconfig.js';
import { PROFILE_API_URL } from '../apis.js';

const{
    // GET_USER_DETAILS_API,
    // GET_USER_JOINED_API,
    // GET_USER_CREATED_API,
    // DELETE_USER_API,
    // UPDATE_USER_API,
    TOTAL_USER_API
} = PROFILE_API_URL;

export const fetchAllUser = async () => {
    try {
        console.log('Fetching all User' , PROFILE_API_URL);
        const response = await apiConnector('GET' , TOTAL_USER_API);
        console.log("RESPONSE", response);
        return response.data;
    } catch (err) {
        console.log("ERROR DURING FETCHING ALL USER API => " ,  err);
        throw err;
    }
};
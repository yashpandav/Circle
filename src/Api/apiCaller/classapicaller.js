import {CLASS_API_URL} from '../apis';
import {apiConnector} from '../apiconfig';

const {
    // CREATE_CLASS_API,
    // JOIN_CLASS_API,
    // GET_CLASS_API,
    GET_ALL_CLASS_API,
    // DELETE_CLASS_API,
    // UPDATE_CLASS_API,
    // LEFT_CLASS_API,
} = CLASS_API_URL;

export const fetchAllClasses = async () => {
    try {
        // console.log('Fetching all classes' , GET_ALL_CLASS_API);
        const response = await apiConnector('GET' , GET_ALL_CLASS_API);
        if(!response){
            // console.log(response);
            throw new Error('API FETCHED BUT SOMETHING WENT WRONG WITH A RESPONSE');
        }

        if(!response.data.success){
            throw new Error("RESPONSE failed , FALSE")
        }

        // console.log("RESPONSE", response);
        return response.data;
    } catch (err) {
        // console.log("ERROR DURING FETCHING ALL CLASS API => " ,  err);
        throw err;
    }
};

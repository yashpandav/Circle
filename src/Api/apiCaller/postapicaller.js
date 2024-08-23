import {POST_API_URL} from '../apis.js';
import {apiConnector} from '../apiconfig.js';
import toast from 'react-hot-toast';

const {
    CREATE_POST_API,
    GET_POST_API
} = POST_API_URL;

export const createPost = async(data) => {
    try{
        console.log("DATA " , data);
        const response = await apiConnector('POST', CREATE_POST_API, data);
        console.log("API RESPONSE ", response);
        toast.success('Post created successfully!');
        return response.data;
    }catch(err){
        console.log("Error During Creating Post " , err);
        return err.response? err.response : err.message;
    }
}
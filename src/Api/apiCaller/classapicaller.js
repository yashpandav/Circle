import { CLASS_API_URL } from '../apis';
import { apiConnector } from '../apiconfig';
import toast from 'react-hot-toast';
const {
    CREATE_CLASS_API,
    JOIN_CLASS_API,
    // GET_CLASS_API,
    GET_ALL_CLASS_API,
    // DELETE_CLASS_API,
    // UPDATE_CLASS_API,
    // LEFT_CLASS_API,
} = CLASS_API_URL;

export const fetchAllClasses = async () => {
    try {
        // console.log('Fetching all classes' , GET_ALL_CLASS_API);
        const response = await apiConnector('GET', GET_ALL_CLASS_API);
        if (!response) {
            // console.log(response);
            throw new Error('API FETCHED BUT SOMETHING WENT WRONG WITH A RESPONSE');
        }

        if (!response.data.success) {
            throw new Error("RESPONSE failed , FALSE")
        }

        // console.log("RESPONSE", response);
        return response.data;
    } catch (err) {
        // console.log("ERROR DURING FETCHING ALL CLASS API => " ,  err);
        throw err;
    }
};

export const createClass = async ({ data }) => {
    try {
        let {banner} = data;
        data = {
            ...data ,
            banner: banner[0]
        }
        const response = await apiConnector('POST', CREATE_CLASS_API, data, {
                "Content-Type": "multipart/form-data",
            });
        console.log("API RESPONSE ", response);
        toast.success('Successfully created new Circle')
    } catch (err) {
        console.log("SOMETHING WENT WRONG WHILE CALLING CREATE CLASS API ", err);
        return err.response ? err.response : err.message;
    }
}

export const joinClass = async (data) => {
    try{
        console.log(data);
        const response = await apiConnector('POST' , JOIN_CLASS_API , data);
        console.log("API RESPONSE ", response);
        toast.success('Successfully Joined Circle');
    }catch(err){
        if(err.response.status === 404){
            toast.error('Circle Not Found');
            return;
        }
        if(err.response.status === 400){
            toast.error('You are already enrolled in this Circle');
            return;
        }
        console.log("SOMETHING WENT WRONG WHILE CALLING JOIN CLASS API ", err);
        return err.response? err.response : err.message;
    }
}
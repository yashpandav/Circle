import { COMMENTS_API_URL } from "../apis";
import { apiConnector } from "../apiconfig";
import toast from 'react-hot-toast';


const {
    CREATE_COMMENT_API
} = COMMENTS_API_URL;

export const createComment = (data) => {
    return async (dispatch) => {
        try {
            const response = await apiConnector("POST", CREATE_COMMENT_API, data);
            toast.success("Comment added!");
            dispatch({
                type: 'COMMENT_CREATED',
                payload: response.data,
            });
            return response.data;
        } catch (err) {
            console.log("Error during creating comment", err);
            toast.error("Something went wrong while creating comment");
            return err.response? err.response : err.message;
        }
    };
};

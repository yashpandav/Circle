const BASE_URL = process.env.REACT_APP_BASE_URL;

//* AUTH API URL
export const AUTH_API_URL = {
    SEND_OTP_API: BASE_URL + '/auth/user/genrateOtp',
    SIGNUP_API: BASE_URL + "/auth/user/signup",
    LOGIN_API: BASE_URL + "/auth/user/login",
    CHANGE_PASSWORD_API: BASE_URL + "/auth/user/changepassword",
};

//* USER API URL
export const PROFILE_API_URL = {
    GET_USER_DETAILS_API: BASE_URL + "/user/getuser",
    GET_USER_JOINED_API: BASE_URL + "/user/joined",
    GET_USER_CREATED_API: BASE_URL + "/user/created",
    DELETE_USER_API: BASE_URL + "/user/deleteuser",
    UPDATE_USER_API: BASE_URL + "/user/updateProfile",
};

export const CLASS_API_URL = {
    CREATE_CLASS_API: `${BASE_URL}/class/create`,
    JOIN_CLASS_API: `${BASE_URL}/class/join`,
    GET_CLASS_API: `${BASE_URL}/class/getdetails`,
    GET_ALL_CLASS_API: `${BASE_URL}/class/allclass`,
    DELETE_CLASS_API: `${BASE_URL}/class/delete`,
    UPDATE_CLASS_API: `${BASE_URL}/class/update`,
    LEFT_CLASS_API: `${BASE_URL}/class/left`,
};

//* ASSIGNMENT API URL
export const ASSIGNMENT_API_URL = {
    CREATE_ASSIGNMENT_API: BASE_URL + "/assignment/create",
    EDIT_ASSIGNMENT_API: BASE_URL + "/assignment/edit",
    GET_ASSIGNMENT_API: BASE_URL + "/assignment/detail",
    DELETE_ASSIGNMENT_API: BASE_URL + "/assignment/delete",
    SUBMIT_ASSIGNMENT_API: BASE_URL + "/assignment/submit",
    DELETED_SUBMITTED_ASSIGNMENT_API: BASE_URL + "/assignment/deletesubmission",
    EDITED_SUBMITTED_ASSIGNMENT_API: BASE_URL + "/assignment/editsubmitted",
};

//* REVIEWS API URL
export const REVIEWS_API_URL = BASE_URL + "/reviews"


//* COMMENTS API URL
export const COMMENTS_API_URL = {
    CREATE_COMMENT_API: BASE_URL + "/comment/create",
    DELETE_COMMENT_API: BASE_URL + "/comment/delete",
    EDIT_COMMENT_API: BASE_URL + "/comment/edit",
    GET_ALL_COMMENT_API: BASE_URL + "/comment/details",
};

//* POST API URL
export const POST_API_URL = {
    CREATE_POST_API: BASE_URL + "/post/create",
    DELETE_POST_API: BASE_URL + "/post/delete",
    EDIT_POST_API: BASE_URL + "/post/edit",
    GET_POST_API: BASE_URL + "/post/detail",
};

//* TODOS API URL
export const TODOS_API_URL = BASE_URL + "/todos"

//* CATEGORY API URL
export const CATEGORY_API_URL = {
    CREATE_CATEGORY_API: BASE_URL + "/category/create",
    DELETE_category_API: BASE_URL + "/category/delete",
    EDIT_CATEGORY_API: BASE_URL + "/category/edit",
    GET_CATEGORY_API: BASE_URL + "/category/details",
    ADD_ASS_INTO_CATEGORY_API: BASE_URL + "/category/assignment/add",
    DELETE_ASS_FROM_CATEGORY_API: BASE_URL + "/category/assignment/delete",
    ADD_POST_INTO_CATEGORY_API: BASE_URL + "/category/post/add",
    DELETE_POST_FROM_CATEGORY_API: BASE_URL + "/category/post/delete",
};
import { apiConnector } from '../apiconfig.js';
import { AUTH_API_URL } from '../apis.js';

const {
    SEND_OTP_API,
    SIGNUP_API,
    LOGIN_API,
    CHANGE_PASSWORD_API,
} = AUTH_API_URL;

export const sendOTP = async (email, navigate) => {
    try {
        console.log('sending OTP', SEND_OTP_API);

        const response = await apiConnector('POST', SEND_OTP_API, {
            email: email
        });

        if (!response || !response.data || !response.data.success) {
            throw new Error('Failed to send OTP');
        }

        // console.log("Response status:", response.status);
        // console.log("Response data:", response.data);
        console.log("OTP SENT SUCCESSFULLY");
        navigate('/auth/otp');
    } catch (err) {
        console.log("ERROR DURING SENDING OTP API => ", err.response ? err.response.data : err.message);
        return false;
    }
};


export const signUp = async (firstName,
    lastName,
    email,
    password,
    confirmPassword,
    otp,
    navigate) => {
    try {
        console.log("Sending SIGNUP request" , SIGNUP_API);

        const response = await apiConnector('POST', SIGNUP_API, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            otp: otp,
        });

        if(!response || !response.data || !response.data.success) {
            throw new Error('Failed to send signup api');
        }
        console.log("ACCOUNT CREATED");
        console.log("RESPONSE", response);
        navigate('/');
    } catch (err) {
        console.log("ERROR DURING SENDING SIGNUP API => ", err.response ? err.response.data : err.message);
        return false;
    }
}
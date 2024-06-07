import { apiConnector } from '../apiconfig.js';
import { AUTH_API_URL } from '../apis.js';
import axios from 'axios';

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
        navigate('/');
    } catch (err) {
        console.log("ERROR DURING SENDING OTP API => ", err.response ? err.response.data : err.message);
        return false;
    }
};

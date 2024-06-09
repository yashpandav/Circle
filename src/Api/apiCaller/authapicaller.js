import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../apiconfig';
import { AUTH_API_URL } from '../apis';
import toast from 'react-hot-toast';
const { SEND_OTP_API, SIGNUP_API } = AUTH_API_URL;

export const sendOTP = createAsyncThunk(
    'sendOTP',
    async ({ email, navigate }) => {
        try {
            // console.log(email);
            const response = await apiConnector('POST', SEND_OTP_API, { email });
            // console.log(response);
            // console.log(response.status);
            // if (!response || !response.success) {
            //     throw new Error('Failed to send OTP');
            // }
            navigate('/auth/otp');
            return response;
        } catch (err) {
            // if(err.response.status === 409){
            //     <Alert severity="error">Email already exists</Alert>
            // }
            toast.error("USER ALREADY EXISTS" , {
                position : 'top-right'
            });
            return err.response ? err.response : err.message;
        }
    }
);

export const signUp = createAsyncThunk(
    'singup',
    async ({ firstName, lastName, email, password, confirmPassword, otp, navigate }) => {
        try {
            // console.log(`${firstName} ${lastName} ${email} ${password} ${confirmPassword} ${otp}`);
            const response = await apiConnector('POST', SIGNUP_API, {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                otp,
            });
            // console.log(response);
            // console.log(response.status);
            navigate('/');
            toast.success("User Successfully Registered")
            return response;
        } catch (err) {
            toast.error("INVALID OTP");
            // console.log("response error: " , err.response);
            return err.response ? err.response : err.message;
        }
    }
);

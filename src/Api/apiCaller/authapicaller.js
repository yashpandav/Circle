import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../apiconfig';
import { AUTH_API_URL } from '../apis';

const { SEND_OTP_API, SIGNUP_API } = AUTH_API_URL;

export const sendOTP = createAsyncThunk(
    'sendOTP',
    async (email) => {
        try {
            const response = await apiConnector('POST', SEND_OTP_API, { email });
            if (!response.data.success) {
                throw new Error('Failed to send OTP');
            }
            return response.data;
        } catch (err) {
            return err.response ? err.response.data : err.message;
        }
    }
);

export const signUp = createAsyncThunk(
    'singup',
    async ({ firstName, lastName, email, password, confirmPassword, otp }) => {
        try {
            console.log(`${firstName} ${lastName} ${email} ${password} ${confirmPassword} ${otp}`);
            const response = await apiConnector('POST', SIGNUP_API, {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                otp,
            });
            if (!response.data.success) {
                throw new Error('Failed to create account');
            }
            return response.data;
        } catch (err) {
            return err.response ? err.response.data : err.message;
        }
    }
);

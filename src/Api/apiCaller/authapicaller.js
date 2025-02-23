import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../apiconfig';
import { AUTH_API_URL } from '../apis';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { setUser } from '../../Slices/authSlice';
import { setLoggedIn } from '../../Slices/authSlice';
import { setToken } from '../../Slices/authSlice';
const { SEND_OTP_API, SIGNUP_API, LOGIN_API, LOGOUT_API, VALIDATE_API, VALIDATE_EMAIL, FORGOT_PASSSWORD_API } = AUTH_API_URL;

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
            toast.error("USER ALREADY EXISTS", {
                position: 'top-right'
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
            navigate('/auth/login');
            toast.success("User Successfully Registered")
            return response;
        } catch (err) {
            toast.error("INVALID OTP");
            // console.log("response error: " , err.response);
            return err.response ? err.response : err.message;
        }
    }
);

export const logIn = createAsyncThunk(
    'login',
    async ({ email, password, navigate, dispatch }) => {
        try {
            // console.log("email " , email  , "password " , password);
            const response = await apiConnector('POST', LOGIN_API, {
                email,
                password
            });
            // console.log(response.data.data);
            dispatch(setUser(response.data.data));
            dispatch(setLoggedIn(true));
            dispatch(setToken(response.data.data.token));
            // const dispatch = useDispatch();
            // const { setUser } = useSelector((state) => state.auth);
            // dispatch(setUser(response.data.data));
            // console.log(setUser);
            // console.log(response.data.data);
            navigate('/');
            Cookies.set('token', response.data.data.token, { expires: 2 });
            toast.success('LogIn Success');
            return response;
        } catch (err) {
            console.log(err);
            // console.log(err.response);
            if (err.response.status === 400) {
                toast.error("Invalid Email , User Not Found");
            }
            else toast.error("Wrong Password");
            return err.response ? err.response : err.message;
        }
    }
)

export const logOut = createAsyncThunk(
    'logOut',
    async ({ dispatch, navigate }) => {
        try {
            console.log('LogOut Function');
            const response = await apiConnector('POST', LOGOUT_API);
            dispatch(setLoggedIn(false));
            dispatch(setUser(null));
            navigate('/');
            Cookies.remove('token');
            toast.success('LogOut Success');
            return response;
        } catch (err) {
            console.log(err);
            toast.error('Failed to log out');
            return err.response ? err.response : err.message;
        }
    }
);

export const validateLogin = createAsyncThunk(
    'validateLogin',
    async ({ dispatch, navigate }) => {
        try {
            console.log('Validate Login Function');
            const response = await apiConnector('POST', VALIDATE_API);
            console.log(response);
            dispatch(setUser(response.data.data));
            dispatch(setLoggedIn(true));
            dispatch(setToken(response.data.data.token));
            Cookies.set('token', response.data.data.token, {
                expires: '2'
            });
            toast.success('Login Success')
        } catch (err) {
            return err.response ? err.response : err.message;
        }
    }
)

export const validateEmail = async (email) => {
    try {
        const response = await apiConnector('POST', VALIDATE_EMAIL, email);
        toast.success("OTP has been sent to your email.");
        return response.data;
    } catch (err) {
        if (err?.response?.status === 400) {
            toast.error("Email ID is required");
        }
        if (err?.response?.status === 404) {
            toast.error("Enter your registered email address");
        }
        if (err?.response?.status === 422) {
            toast.error("Failed to generate OTP, Please try again");
        }
        if (err?.response?.status === 500) {
            toast.error("Server is not responding");
        }
        return err.response ? err.response : err.message;
    }
}

export const forgotPassword = async (
    { email, newPassword, confirmNewPassword, otp, navigate }) => {
    try {
        const response = await apiConnector('POST', FORGOT_PASSSWORD_API, {
            email,
            newPassword,
            confirmNewPassword,
            otp
        });
        toast.success('Password Reset Success')
        navigate('/auth/login')
        return response.data;
    } catch (err) {
        if (err?.response?.status === 400) {
            toast.error("The new password cannot be the same as the old password");
        }   
        if (err?.response?.status === 404) {
            toast.error("No user found");
        }
        if (err?.response?.status === 401) {
            toast.error("Invalid or Expired OTP");
        }
        if (err?.response?.status === 500) {
            toast.error("Server is not responding");
        }
        return err.response ? err.response : err.message;
    }
}
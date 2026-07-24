import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Divider from "@mui/material/Divider";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { sendOTP } from "../../Api/apiCaller/authapicaller";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../Slices/authSlice";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import "./signup.css";
import { SendingOTPLoader } from "../Helper/Loaders/loader";
import { setLoading } from "../../Slices/loadingSlice";

export default function SignUp() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showFinalPassword, setShowFinalPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowFinalPassword = () => {
        setShowFinalPassword(!showFinalPassword);
    };

    const dispatch = useDispatch();

    const loading = useSelector((state) => state.loading.loading);

    const onSubmitHandler = async (data) => {
        // console.log(data);
        dispatch(setLoading(true));
        dispatch(setUser(data));
        const email = data.email;
        try {
            await dispatch(sendOTP({ email, navigate })).unwrap();
            // console.log("RESULT", result);
        } catch (err) { 
            // console.error("Failed to send OTP:", err);
            toast.error("Failed to send OTP");
        }
        dispatch(setLoading(false));
    };

    //* SENDING OTP LOADER
    if(loading){
        return (
            <SendingOTPLoader></SendingOTPLoader>
        )
    }

    return (
        <div id="body">
            <div className="auth-card-wrapper">
                <img
                    src={require("../../Data/Images/5oob9hmb.png")}
                    alt="signup-teacher-img"
                    id="signup-teacher-img"
                />
            <div className="main-signup-form">
                <div className="form-container">
                    <h1>New Account?</h1>
                    <pre>Sign Up</pre>
                    <form id="signup-form" onSubmit={handleSubmit(onSubmitHandler)}>
                        <div className="form-group">
                            <PersonOutlineOutlinedIcon
                                sx={{ color: "action.active", mr: 1.5, mt: 2 }}
                            />
                            <div className="input-fileds">
                                <TextField
                                    type="text"
                                    label="First Name"
                                    variant="standard"
                                    required
                                    fullWidth
                                    {...register("firstName", {
                                        required: "First Name is Required",
                                    })}
                                />
                                {errors.firstName && <p className="error-msg">{errors.firstName.message}</p>}
                            </div>
                        </div>
                        <div className="form-group">
                            <PersonOutlineOutlinedIcon
                                sx={{ color: "action.active", mr: 1.5, mt: 2 }}
                            />
                            <div className="input-fileds">
                                <TextField
                                    type="text"
                                    label="Last Name"
                                    variant="standard"
                                    required
                                    fullWidth
                                    {...register("lastName", {
                                        required: "Last Name is Required",
                                    })}
                                />
                                {errors.lastName && <p className="error-msg">{errors.lastName.message}</p>}
                            </div>
                        </div>
                        <div className="form-group">
                            <EmailOutlinedIcon
                                sx={{ color: "action.active", mr: 1.5, mt: 2 }}
                            />
                            <div className="input-fileds">
                                <TextField
                                    type="email"
                                    label="E-Mail"
                                    variant="standard"
                                    required
                                    fullWidth
                                    {...register("email", {
                                        required: "E-Mail is Required",
                                        pattern: {
                                            value: /^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/gmu,
                                            message: "Invalid email address",
                                        },
                                    })}
                                />
                                {errors.email && <p className="error-msg">{errors.email.message}</p>}
                            </div>
                        </div>
                        <div className="form-group">
                            <LockOutlinedIcon
                                sx={{ color: "action.active", mr: 1.5, mt: 2 }}
                            />
                            <div className="input-fileds">
                                <TextField
                                    type={showPassword ? "text" : "password"}
                                    label="Password"
                                    variant="standard"
                                    required
                                    fullWidth
                                    {...register("password", {
                                        required: "Password is Required",
                                        pattern: {
                                            value: /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{5,}$/,
                                            message: "Password must be at least 5 characters long including a number",
                                        },
                                    })}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? (
                                                        <VisibilityOutlinedIcon />
                                                    ) : (
                                                        <VisibilityOffOutlinedIcon />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {errors.password && <p className="error-msg">{errors.password.message}</p>}
                            </div>
                        </div>
                        <div className="form-group">
                            <LockOutlinedIcon
                                sx={{ color: "action.active", mr: 1.5, mt: 2 }}
                            />
                            <div className="input-fileds">
                                <TextField
                                    type={showFinalPassword ? "text" : "password"}
                                    label="Confirm Password"
                                    variant="standard"
                                    required
                                    fullWidth
                                    {...register("confirmPassword", {
                                        required: "Confirm Password is Required",
                                        validate: value =>
                                            value === watch("password") || "Passwords do not match",
                                    })}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle final password visibility"
                                                    onClick={handleClickShowFinalPassword}
                                                    edge="end"
                                                >
                                                    {showFinalPassword ? (
                                                        <VisibilityOutlinedIcon />
                                                    ) : (
                                                        <VisibilityOffOutlinedIcon />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>
                        <Button type="submit" variant="contained" id="registerbutton">
                            Register
                        </Button>
                    </form>
                    <Divider sx={{ margin: '1.2rem 0' }}>or</Divider>
                    <Button variant="contained" id="googlebtn">
                        <FcGoogle size={24} style={{ marginRight: '8px' }} />
                        Register with Google
                    </Button>
                </div>
                <svg
                    className="wave-divider"
                    viewBox="0 0 60 100"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ flexShrink: 0, display: 'block', alignSelf: 'stretch', width: '50px' }}
                >
                    <path
                        d="M40,0 C60,25 60,75 40,100 L0,100 L0,0 Z"
                        fill="#ffffff"
                    />
                </svg>
                <div id="secondary">
                    <div className="sec-content">
                        <h2>Welcome To Circle</h2>
                        <pre>Already have an account?</pre>
                        <Link to='/auth/login'>
                            <Button variant="text" id="login-btn">
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
import React from "react";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Divider from "@mui/material/Divider";
import { FcGoogle } from "react-icons/fc";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import './login.css'
import './signup.css'
import { logIn } from '../../Api/apiCaller/authapicaller.js';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ForgotPassword from "./ForgotPassword.jsx";

export default function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    async function loginSubmitHandler(data) {
        // console.log(data);
        const email = data.email;
        const password = data.password;
        try {
            await dispatch(logIn({email , password , navigate , dispatch})).unwrap();
            // console.log(response);
        } catch (err) {
            // console.log("Failed to log in" , err);
            toast.error("Failed to log in");
        }

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
                <div className="form-container" id="login-container">
                    <h1>Already have an account? </h1>
                    <pre>Log In</pre>
                    <form id='login-form' onSubmit={handleSubmit(loginSubmitHandler)}>
                        <div className="form-group">
                            <EmailOutlinedIcon
                                sx={{ color: 'action.active', mr: 1.5, mt: 2 }}
                            />
                            <div className="input-fileds">
                                <TextField
                                    type="email"
                                    label="E-Mail"
                                    variant="standard"
                                    placeholder="Enter registered email address"
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
                                    placeholder="Enter your password"
                                    required
                                    fullWidth
                                    {...register("password", {
                                        required: "Password is Required",
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
                        <Button type="submit" variant="contained" id="loginbtn">
                            LogIn
                        </Button>
                    </form>
                    <div className="form-footer-link">
                        <Link to='/auth/forgot-password' id="forgotpass" element={<ForgotPassword/>}>
                            Forgot Password?
                        </Link>
                    </div>
                    <Divider sx={{ margin: '0.8rem 0' }}>or</Divider>
                    <Button variant="contained" id="googlebtn">
                        <FcGoogle size={24} style={{ marginRight: '8px' }} />
                        LogIn with Google
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
                        <pre>Don't have an account?</pre>
                        <Link to='/auth/signup'>
                            <Button variant="text" id="login-btn">
                                SignUp
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
import React from "react";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Divider from "@mui/material/Divider";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import './login.css'
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

    function loginSubmitHandler(data) {
        // console.log(data);
        const email = data.email;
        const password = data.password;
        try {
            dispatch(logIn({email , password , navigate , dispatch})).unwrap();
            // console.log(response);
        } catch (err) {
            // console.log("Failed to log in" , err);
            toast.error("Failed to log in");
        }

    }

    return (
        <div id="body">
            <img
                src={require("../../Data/Images/5oob9hmb.png")}
                alt="signup-teacher-img"
                id="signup-teacher-img"
            ></img>
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
                                            value: /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gmu,
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
                        <div className="form-group">
                            <Link to='/auth/forgot-password' id="forgotpass" element={<ForgotPassword/>}>
                                Forgot Password?
                            </Link>
                        </div>
                    </form>
                    <Divider>or</Divider>
                    <Button variant="contained">LogIn with Google</Button>
                </div>
                <svg
                    width="67px"
                    height="578px"
                    viewBox="0 0 67 578"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g
                        id="Page-1"
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                    >
                        <path
                            d="M11.3847656,-5.68434189e-14 C-7.44726562,36.7213542 5.14322917,126.757812 49.15625,270.109375 C70.9827986,341.199016 54.8877465,443.829224 0.87109375,578 L67,578 L67,-5.68434189e-14 L11.3847656,-5.68434189e-14 Z"
                            id="Path"
                            stroke="#4db6ac"
                            fill="#4db6ac"
                        ></path>
                    </g>
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
    );
}
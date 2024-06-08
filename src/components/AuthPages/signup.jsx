import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";
import { sendOTP } from "../../Api/apiCaller/authapicaller";
import { useDispatch } from "react-redux";
import { setUser } from "../../Slices/authSlice";
import toast from "react-hot-toast";
import "./signup.css";

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

    const onSubmitHandler = async (data) => {
        console.log(data);
        dispatch(setUser(data));
        const email = data.email;
        try {
            const result = await dispatch(sendOTP({ email, navigate })).unwrap();
            console.log("RESULT", result);

        } catch (err) {
            console.error("Failed to send OTP:", err);
            toast.error("Failed to send OTP");
        }
    };

    return (
        <div id="body">
            <img
                src={require("../../Data/Images/5oob9hmb.png")}
                alt="signup-teacher-img"
                id="signup-teacher-img"
            ></img>
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
                    <Divider>or</Divider>
                    <Button variant="contained">Register with Google</Button>
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
                        <pre>Already have an account?</pre>
                        <Button variant="text" id="login-btn">
                            Login
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
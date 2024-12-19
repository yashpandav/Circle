import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { SendingOTPLoader, LoaderComponent } from "../Helper/Loaders/loader";
import { validateEmail } from "../../Api/apiCaller/authapicaller";
import { forgotPassword } from "../../Api/apiCaller/authapicaller.js";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../Slices/loadingSlice";
import "./forgotPassword.css";

export default function ForgotPassword() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [step, setStep] = useState(1);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector((state) => state.loading.loading);

    const handleEmailSubmit = async (data) => {
        dispatch(setLoading(true));
        try {
            const response = await validateEmail({ email: data.email });
            if (response.success) {
                setStep(2);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to send OTP. Please try again.");
        }
        dispatch(setLoading(false));
    };

    const handleResetPassword = async (data) => {
        dispatch(setLoading(true));
        try {
            await forgotPassword({
                email: data.email,
                otp: data.otp,
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword,
                navigate
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to change password. Please try again.");
        }
        dispatch(setLoading(false));
    };

    const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);
    const handleClickShowConfirmNewPassword = () => setShowConfirmNewPassword(!showConfirmNewPassword);

    if (loading) {
        return step === 2 ? <LoaderComponent /> : <SendingOTPLoader />;
    }

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-image">
                <img
                    src={require("../../Data/Images/Forgot password-pana.png")}
                    alt="forgot-password-img"
                />
            </div>
            <div className="forgot-password-form">
                <h1>Forgot Password?</h1>

                <p>{step === 1 ? "Do not worry 🤗, Enter your registered email to receive an OTP." : "Reset your password below."}</p>

                {step === 1 && (
                    <form onSubmit={handleSubmit(handleEmailSubmit)}>
                        <div className="form-group">
                            <EmailOutlinedIcon sx={{ color: "action.active", mr: 1.5, mt: 2 }} />
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
                        <div className="form-btn">
                            <Button type="submit" variant="contained" className="form-button">
                                Send OTP
                            </Button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSubmit(handleResetPassword)}>
                        <div className="form-group">
                            <div className="input-fileds">
                                <TextField
                                    type="text"
                                    label="Enter OTP"
                                    variant="standard"
                                    required
                                    fullWidth
                                    inputProps={{
                                        maxLength: 6,
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                        style: {
                                            letterSpacing: "0.5rem",
                                            textAlign: "center",
                                        },
                                    }}
                                    {...register("otp", {
                                        required: "OTP is Required",
                                        pattern: {
                                            value: /^\d{6}$/,
                                            message: "OTP must be 6 digits",
                                        },
                                    })}
                                />
                                {errors.otp && <p className="error-msg">{errors.otp.message}</p>}
                            </div>
                        </div>
                        <div className="form-group">
                            <LockOutlinedIcon sx={{ color: "action.active", mr: 1.5, mt: 2 }} />
                            <div className="input-fileds">
                                <TextField
                                    type={showNewPassword ? "text" : "password"}
                                    label="New Password"
                                    variant="standard"
                                    required
                                    fullWidth
                                    {...register("newPassword", {
                                        required: "New Password is Required",
                                        pattern: {
                                            value: /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{5,}$/,
                                            message: "Password must be at least 5 characters long including a number",
                                        },
                                    })}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowNewPassword}>
                                                    {showNewPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {errors.newPassword && <p className="error-msg">{errors.newPassword.message}</p>}
                            </div>
                        </div>
                        <div className="form-group">
                            <LockOutlinedIcon sx={{ color: "action.active", mr: 1.5, mt: 2 }} />
                            <div className="input-fileds">
                                <TextField
                                    type={showConfirmNewPassword ? "text" : "password"}
                                    label="Confirm New Password"
                                    variant="standard"
                                    required
                                    fullWidth
                                    {...register("confirmNewPassword", {
                                        required: "Confirm Password is Required",
                                        validate: value => value === watch("newPassword") || "Passwords do not match",
                                    })}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowConfirmNewPassword}>
                                                    {showConfirmNewPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {errors.confirmNewPassword && <p className="error-msg">{errors.confirmNewPassword.message}</p>}
                            </div>
                        </div>
                        <div className="form-btn">
                            <Button type="submit" variant="contained" className="form-button">
                                Reset Password
                            </Button>
                        </div>
                    </form>
                )}

                <Link to="/auth/login" className="back-to-login">
                    Remember Password? Back to Login
                </Link>
            </div>
        </div>
    );
}

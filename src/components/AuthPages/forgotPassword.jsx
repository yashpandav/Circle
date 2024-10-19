import React, { useState } from "react";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import OTPInput from "react-otp-input";
import "./forgotPassword.css";

export default function ForgotPassword() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const sendOtpHandler = (data) => {
        const email = data.email;
        setOtpSent(true);
        toast.success("OTP sent successfully!");
    };

    const verifyOtpHandler = (data) => {
        const { otp, newPassword, confirmPassword } = data;
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        setOtpVerified(true);
        toast.success("Password reset successfully!");
    };
    
    const [otp, setOtp] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const [showFinalPassword, setShowFinalPassword] = useState(false);
    const handleClickShowFinalPassword = () => {
        setShowFinalPassword(!showFinalPassword);
    };

    return (
        <div id="forgot-password-body">
            <div className="forgot-password-container">
                <div className="forgot-password-image">
                    <img
                        src={require("../../Data/Images/Forgot password-pana.png")}
                        alt="Forgot Password"
                    />
                </div>

                <div className="forgot-password-form">
                    {!otpSent ? (
                        <form onSubmit={handleSubmit(sendOtpHandler)} id="send-otp-form">
                            <h2>Forgot Password</h2>
                            <div className="form-group">
                                <EmailOutlinedIcon
                                    sx={{ color: "action.active", mr: 1.5, mt: 2 }}
                                />
                                <div className="input-fileds">
                                    <TextField
                                        type="email"
                                        label="Enter Email"
                                        variant="standard"
                                        fullWidth
                                        required
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gmu,
                                                message: "Invalid email address",
                                            },
                                        })}
                                    />
                                    {errors.email && (
                                        <p className="error-msg">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>

                            <Button variant="contained" type="submit" id="send-otp-btn">
                                Send OTP
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit(verifyOtpHandler)} id="verify-otp-form">
                            <h2>Verify OTP</h2>

                            <div className="form-group">
                                <div className="otp-input-container">
                                    <OTPInput
                                        value={otp}
                                        onChange={(otp) => setOtp(otp)}
                                        numInputs={6}
                                        inputType="tel"
                                        renderInput={(props) => <input {...props} />}
                                        shouldAutoFocus={true}
                                        inputStyle={{
                                            fontSize: "1.5rem",
                                            width: "45px",
                                            height: "55px",
                                            margin: "0 8px",
                                            borderRadius: "8px",
                                            border: "1px solid #ccc",
                                            outline: "none",
                                            textAlign: "center",
                                        }}
                                        
                                        focusStyle={{
                                            border: "2px solid #00796b",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <LockOutlinedIcon
                                    sx={{ color: "action.active", mr: 1.5, mt: 2 }}
                                />
                                <div className="input-fileds">
                                    <TextField
                                        type={showPassword ? "text" : "password"}
                                        label="New Password"
                                        variant="standard"
                                        fullWidth
                                        required
                                        {...register("newPassword", {
                                            required: "New Password is required",
                                            pattern: {
                                                value: /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{5,}$/,
                                                message:
                                                    "Password must be at least 5 characters long including a number",
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
                                    {errors.newPassword && (
                                        <p className="error-msg">{errors.newPassword.message}</p>
                                    )}
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
                                        fullWidth
                                        required
                                        {...register("confirmPassword", {
                                            required: "Confirm Password is required",
                                            validate: value =>
                                                value === watch("newPassword") || "Passwords do not match",
                                        })}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
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
                                    {errors.confirmPassword && (
                                        <p className="error-msg">
                                            {errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Button variant="contained" type="submit" id="reset-password-btn">
                                Reset Password
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

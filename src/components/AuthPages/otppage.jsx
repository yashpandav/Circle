import React from "react";
import OTPInput from "react-otp-input";
import { Button } from "@mui/material";
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from '../../Api/apiCaller/authapicaller.js';
import toast from "react-hot-toast";
import { setUser } from "../../Slices/authSlice.js";
import "./otppage.css";

export default function OtpPage() {
    const [otp, setOtp] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        if (!user) {
            navigate("/auth/signup");
        }
    }, []);

    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword
    } = user;

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log("SET user IN OTPPAGE", setUser);
        // console.log(`${firstName} ${lastName} ${email} ${password} ${confirmPassword} ${otp}`);
        try {
            const response = dispatch(signUp({
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                otp,
                navigate
            }
            )
            ).unwrap();
            // console.log("RESPONSE  ", response);
        } catch (err) {
            console.log("failed to create a user", err);
            toast.error("Something went wrong while creating user", {
                position: 'top-right'
            });
        }
    }

    return (
        <div className="otp-container">
            <div>
                <h1>Verify Email</h1>
                <p>A verification code has been sent to you. Enter the code below</p>
            </div>
            <form id="otp-form" onSubmit={handleSubmit}>
                <OTPInput
                    value={otp}
                    onChange={(otp) => setOtp(otp)}
                    numInputs={6}
                    inputType="tel"
                    renderInput={(props) => <input {...props} />}
                    shouldAutoFocus={true}
                    inputStyle={{
                        width: "4rem",
                        height: "4rem",
                        fontSize: "1.4em",
                        margin: "1rem",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        textAlign: "center",
                        backgroundColor: "white",
                        color: "#555555",
                    }}
                    containerStyle="otp-input-container"
                />
            </form>
            <Button
                variant="contained"
                type="submit"
                id="otp-btn"
                onClick={handleSubmit}
            >
                Verify OTP
            </Button>
        </div>
    )
}
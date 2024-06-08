import React from "react";
import OTPInput from "react-otp-input";
import { Button } from "@mui/material";
import { useState } from "react";
import "./otppage.css";

export default function OtpPage() {
    const [otp, setOtp] = useState("");

    return (
        <div className="otp-container">
            <div>
                <h1>Verify Email</h1>
                <p>A verification code has been sent to you. Enter the code below</p>
            </div>
            <form id="otp-form">
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
                onClick={() => console.log(otp)}
            >
                Verify OTP
            </Button>
        </div>
    );
}

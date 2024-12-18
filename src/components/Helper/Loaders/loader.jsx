import React from "react";
import "./loader.css";

const LoaderComponent = () => <span className="loader"></span>;

const CreatingLoader = () => {
    return (
        <div className="creating-loader">
            <img
                src={require("../../../Data/creatingAccountLoader.gif")}
                alt="creating-account-loader"
            />
            <span class="loading">Wait While Creating An Account</span>
        </div>
    );
};

const SendingOTPLoader = () => {
    return (
        <div className="creating-loader">
            <span className="loader"></span>
            <span className="loading sendipOtp-loader">We Are Sending A OTP</span>
        </div>
    );
};

export { LoaderComponent, CreatingLoader, SendingOTPLoader };

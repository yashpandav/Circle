import React from "react";
import './signupcomplete.css';

export default function SignUpComplete() {
    return (
        <>
            <div className="backdrop"></div>
            <div className="signup-complete">
                <img src={require('../../Data/accountCreate.gif')} alt="signup-complete" />
                <h2>Welcome! 👋</h2>
                <h5>Your Account Has Been Created Successfully.</h5>
            </div>
        </>
    );
}

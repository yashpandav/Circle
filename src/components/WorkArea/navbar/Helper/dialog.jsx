import React from "react";
import { Divider } from "@mui/material";
import './dialog.css';

const Dialog = () => {
    return (
        <div id='dialog-box'>
            <h3 className='dialog-option'>Join Circle</h3>
            <Divider/>
            <h3 className='dialog-option'>Create Circle</h3>
        </div>
    )
};

export default Dialog;

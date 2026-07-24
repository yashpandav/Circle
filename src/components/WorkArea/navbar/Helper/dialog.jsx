import React, { useState } from "react";
import './dialog.css';

const Dialog = ({ setCreateDialog, setJoinDialog, setDialog }) => {
    return (
        <div id='dialog-box'>
            <h3 className='dialog-option' onClick={() => { setJoinDialog(true); setDialog(false); }}>Join Circle</h3>
            <h3 className='dialog-option' onClick={() => { setCreateDialog(true); setDialog(false); }}>Create Circle</h3>
        </div>
    );
};

export default Dialog;
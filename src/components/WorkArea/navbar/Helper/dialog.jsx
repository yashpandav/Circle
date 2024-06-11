import React, { useState } from "react";
import { Divider } from "@mui/material";
import CreateClassDialog from './createClassDialog';
import './dialog.css';

const Dialog = () => {
    const [dialog, setDialog] = useState(false);

    return (
        <div id='dialog-box'>
            <h3 className='dialog-option'>Join Circle</h3>
            <Divider />
            <h3 className='dialog-option' onClick={() => setDialog(true)}>Create Circle</h3>
            {dialog && <CreateClassDialog setDialog={setDialog} /> }
        </div>
    );
};

export default Dialog;

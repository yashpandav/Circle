import React, { useState } from "react";
import { Divider } from "@mui/material";
import CreateClassDialog from './CreateClass/createClassDialog';
import JoinClassDialog from "./JoinClass/joinClassDialog";
import './dialog.css';

const Dialog = () => {
    const [createDialog, setCreateDialog] = useState(false);
    const [joinDialog, setJoinDialog] = useState(false);

    return (
        <div id='dialog-box'>
            <h3 className='dialog-option' onClick={() => setJoinDialog(true)}>Join Circle</h3>
            {joinDialog && <JoinClassDialog setJoinDialog = {setJoinDialog} />}
            <Divider />
            <h3 className='dialog-option' onClick={() => setCreateDialog(true)}>Create Circle</h3>
            {createDialog && <CreateClassDialog setCreateDialog={setCreateDialog} />}
        </div>
    );
};

export default Dialog;
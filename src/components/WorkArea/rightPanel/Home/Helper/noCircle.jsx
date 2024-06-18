import React from "react";
import Button from '@mui/material/Button';
import { useState } from "react";
import JoinClassDialog from "../../../navbar/Helper/JoinClass/joinClassDialog";
import CreateClassDialog from "../../../navbar/Helper/CreateClass/createClassDialog";
import './noCircle.css';

export default function NoCircle() {

    const [createDialog, setCreateDialog] = useState(false);
    const [joinDialog, setJoinDialog] = useState(false);

    return (
        <div id='main-no-circle'>
            <img src={require('../../../../../Data/9315312.png')} alt='no circle' />
            <h1>No Circle Found</h1>
            <div id='nocircle-btn'>
                <Button variant="contained" id="custom-btn" onClick={() => setJoinDialog(true)}>Join a Circle</Button>
                {joinDialog && <JoinClassDialog setJoinDialog = {setJoinDialog} />}
                <Button variant="contained" id="custom-btn" onClick={() => setCreateDialog(true)}>Create a Circle</Button>
                {createDialog && <CreateClassDialog setCreateDialog={setCreateDialog} />}
            </div>
        </div>
    );
}
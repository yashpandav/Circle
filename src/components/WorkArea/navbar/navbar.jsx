import React, { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import UserInfo from '../../MainHomePage/Navbar/Helper/userInfo';
import LoGo from '../../Helper/logo';
import './navbar.css';
import Dialog from "./Helper/dialog";
import CreateClassDialog from './Helper/CreateClass/createClassDialog';
import JoinClassDialog from './Helper/JoinClass/joinClassDialog';

const Navbar = () => {

    const [dialog, setDialog] = useState(false);
    const [createDialog, setCreateDialog] = useState(false);
    const [joinDialog, setJoinDialog] = useState(false);

    function dialogHandler(){
        setDialog(!dialog);
    }

    return (
        <div className="navbar2">
            <LoGo id="logo" />
            <nav id='temp-nav'>
                <ul id='temp-ul'>
                    <li id='iconli' onMouseLeave={() => { setDialog(false) }}>
                        <AddIcon id='add-icon' onClick={dialogHandler} />
                        {dialog && <Dialog setCreateDialog={setCreateDialog} setJoinDialog={setJoinDialog} setDialog={setDialog} />}
                    </li>
                    <li id="user-info-li">
                        <UserInfo />
                    </li>
                </ul>
            </nav>
            {createDialog && <CreateClassDialog setCreateDialog={setCreateDialog} />}
            {joinDialog && <JoinClassDialog setJoinDialog={setJoinDialog} />}
        </div>
    );
};

export default Navbar;

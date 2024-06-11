import React, { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import UserInfo from '../../MainHomePage/Navbar/Helper/userInfo';
import LoGo from '../../Helper/logo';
import './navbar.css';
import Dialog from "./Helper/dialog";

const Navbar = () => {

    const [dialog, setDialog] = useState(false);

    function dialogHandler(){
        setDialog(!dialog);
    }

    return (
        <div className="navbar">
            <LoGo id="logo" />
            <nav id='temp-nav'>
                <ul id='temp-ul'>
                    <li id='iconli' onMouseLeave={() => { setDialog(false) }}>
                        <AddIcon id='add-icon' onClick={dialogHandler} />
                        {dialog && <Dialog />}
                    </li>
                    <li id="user-info-li">
                        <UserInfo />
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Navbar;

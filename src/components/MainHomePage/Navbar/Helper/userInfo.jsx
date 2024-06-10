import React from "react";
import ClassIcon from '@mui/icons-material/Class';
import GradingIcon from '@mui/icons-material/Grading';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useState } from "react";
import './userInfo.css';

export default function UserInfo({ setUser }) {
    const [showDialog, setDialog] = useState(false);

    function dialogHandler() {
        setDialog(!showDialog);
    }

    return (
        <div id="user" onMouseLeave={() => { setDialog(false) }}>
            <img src={setUser.image} alt='user-img' id='user-img' onClick={dialogHandler} />
            {
                showDialog && (
                    <div id='user-dialog'>
                        <div id="img-dialog">
                            <img src={setUser.image} alt='user-img' id='dialog-user-img' />
                            <div id='name-email'>
                                <h3>{setUser.firstName} {setUser.lastName}</h3>
                                <pre>{setUser.email}</pre>
                            </div>
                        </div>
                        <div id='user-info'>
                            <div className="user-data">
                                <ClassIcon />
                                <p>Your Class</p>
                            </div>
                            <div className="user-data">
                                <FormatListBulletedIcon />
                                <p>Your Todo</p>
                            </div>
                            <div className="user-data"> 
                                <GradingIcon />
                                <p style={{whiteSpace : 'nowrap'}}>Your Review List</p>
                            </div>
                        </div>
                        <div id='last-div'>
                            <p>WorkArea</p>
                            <p>Dashboard</p>
                            <p>LogOut</p>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
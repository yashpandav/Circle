import React, { useState } from "react";
import ClassIcon from '@mui/icons-material/Class';
import GradingIcon from '@mui/icons-material/Grading';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useSelector, useDispatch } from "react-redux";
import { logOut } from '../../../../Api/apiCaller/authapicaller';
import { useNavigate } from "react-router-dom";
import './userInfo.css';

export default function UserInfo() {
    const [showDialog, setDialog] = useState(false);

    const dispatch = useDispatch();
    const { setUser, setLoggedIn } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    function dialogHandler() {
        setDialog(!showDialog);
    }

    async function logoutHandler() {
        if (window.confirm("Are you sure you want to log out?")) {
            console.log("SENDING API")
            try {
                await dispatch(logOut({ dispatch, navigate })).unwrap();
            } catch (error) {
                console.error("Logout failed", error);
            }
        }
    }

    return (
        <div id="user" onMouseLeave={() => { setDialog(false) }}>
            <img src={setUser.image} alt='user-img' id='user-img' onClick={dialogHandler} />
            {showDialog && (
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
                            <p style={{ whiteSpace: 'nowrap' }}>Your Review List</p>
                        </div>
                    </div>
                    <div id='last-div'>
                        <p>WorkArea</p>
                        <p>Dashboard</p>
                        <p onClick={logoutHandler}>LogOut</p>
                    </div>
                </div>
            )}
        </div>
    )
}

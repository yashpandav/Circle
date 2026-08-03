import React, { useState } from "react";
import ClassIcon from '@mui/icons-material/Class';
import GradingIcon from '@mui/icons-material/Grading';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useSelector, useDispatch } from "react-redux";
import { logOut } from '../../../../Api/apiCaller/authapicaller';

import { useNavigate } from "react-router-dom";
import './userInfo.css';
import ConfirmationDialog from "../../../Helper/ConfirmationDialog";

export default function UserInfo() {
    const [showDialog, setDialog] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDialog(false);
            }
        }
        if (showDialog) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDialog]);

    function dialogHandler() {
        setDialog(!showDialog);
    }

    function logoutHandler() {
        setConfirmLogout(true);
    }

    async function handleConfirmLogout() {
        setConfirmLogout(false);
        try {
            await dispatch(logOut({ dispatch, navigate })).unwrap();
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    if (!user) {
        return (
            <div id="user" style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#e2e8f0', animation: 'pulse 1.5s infinite' }}>
            </div>
        );
    }

    return (
        <div id="user" ref={dropdownRef}>
            <img src={user?.image} alt='user-img' id='user-img' onClick={dialogHandler} />
            {showDialog && (
                <div id='user-dialog'>
                    <div id="img-dialog">
                        <img src={user?.image} alt='user-img' id='dialog-user-img' />
                        <div id='name-email'>
                            <h3>{user?.firstName} {user?.lastName}</h3>
                            <p>{user?.email}</p>
                        </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div id='user-info'>
                        <div className="user-data">
                            <div className="icon-container"><ClassIcon /></div>
                            <p>Classes</p>
                        </div>
                        <div className="user-data">
                            <div className="icon-container"><FormatListBulletedIcon /></div>
                            <p>To-dos</p>
                        </div>
                        <div className="user-data">
                            <div className="icon-container"><GradingIcon /></div>
                            <p>Reviews</p>
                        </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div id='last-div'>
                        <div className="dropdown-item">WorkArea</div>
                        <div className="dropdown-item">Dashboard</div>
                        <div className="dropdown-item logout" onClick={logoutHandler}>LogOut</div>
                    </div>
                </div>
            )}
            <ConfirmationDialog
                open={confirmLogout}
                title="Log Out"
                content="Are you sure you want to log out of your account?"
                confirmText="Log Out"
                confirmColor="error"
                onConfirm={handleConfirmLogout}
                onCancel={() => setConfirmLogout(false)}
            />
        </div>
    )
}

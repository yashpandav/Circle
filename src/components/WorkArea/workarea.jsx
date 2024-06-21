import React, { useEffect } from 'react';
import LeftMain from './leftPanel/leftPanelMain';
import Navbar from './navbar/navbar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './workarea.css';
import toast from 'react-hot-toast';
import { Info } from '@mui/icons-material';

export default function WorkArea() {
    const toggle = useSelector((state) => state.toggle.toggle);
    const navigate = useNavigate();
    const login = useSelector((state) => state.auth.login);

    useEffect(() => {
        if (!login) {
            navigate('/auth/login');
            toast(
                (t) => (
                    <div className={`toast-custom ${t.visible ? 'show' : ''}`}>
                        <Info style={{ marginRight: '8px' }} />
                        <p>Please Login First</p>
                    </div>
                ),
                {
                    duration: 2000,
                    position: 'top-right',
                    style: {
                        backgroundColor : 'transparent',
                        borderColor : 'transparent',
                        boxShadow : 'none',
                    },
                }
            );
        }
    }, [login, navigate]);

    if (!login) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="workArea">
                    <LeftMain />
                    <div className={`right-main ${toggle ? '' :'box-toggle'}`}>
                        <Outlet />
                    </div>
                </div>
        </>
    );
}

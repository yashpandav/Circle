import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './workarea.css';
import toast from 'react-hot-toast';
import Navbar from './navbar/navbar';
import LeftMain from './leftPanel/leftPanelMain';

export default function WorkArea() {
    const toggle = useSelector((state) => state.toggle.toggle);
    const navigate = useNavigate();
    const login = useSelector((state) => state.auth.login);

    useEffect(() => {
        if (!login) {
            navigate('/auth/login');
            toast.error("Please Login First", { id: 'login-error-toast' });
        }
    }, [login, navigate]);

    if (!login) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="workArea">
                <LeftMain /> {/* No need for Suspense and ErrorBoundary */}
                <div className={`right-main ${toggle ? '' : 'box-toggle'}`}>
                    <Outlet />
                </div>
            </div>
        </>
    );
}
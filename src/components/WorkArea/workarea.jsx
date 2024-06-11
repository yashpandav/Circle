import React from 'react';
import LeftMain from './leftPanel/leftPanelMain';
import Navbar from './navbar/navbar';
import { Outlet } from 'react-router-dom';
import './workarea.css';

export default function WorkArea() {
    return (
        <>
            <Navbar />
            <div className="workArea">
                <LeftMain />
                <div className="right-main">
                    <Outlet />
                </div>
            </div>
        </>
    );
}
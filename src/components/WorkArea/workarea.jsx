import React, { useState } from 'react';
import LeftMain from './leftPanel/leftPanelMain';
import Navbar from './navbar/navbar';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './workarea.css';

export default function WorkArea() {

    const toggle = useSelector((state) => state.toggle.toggle)

    return (
        <>
            <Navbar />
            <div className="workArea">
                <LeftMain/>
                <div className ={ `right-main ${toggle ? 'box-togle' : 'not-toggle'}`}>
                    <Outlet />
                </div>
            </div>
        </>
    );
}
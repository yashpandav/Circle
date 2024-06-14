import React, { useState } from 'react';
import LeftMain from './leftPanel/leftPanelMain';
import Navbar from './navbar/navbar';
import { Outlet } from 'react-router-dom';
import './workarea.css';

export default function WorkArea() {

    const [toggled , setToggle] = useState(false);

    function togleHandler(){
        setToggle(!toggled);
    }

    return (
        <>
            <Navbar />
            <div className="workArea">
                <LeftMain togleHandler = {togleHandler}/>
                <div className ={ `right-main ${toggled ? 'toggle' : ''}`}>
                    <Outlet />
                </div>
            </div>
        </>
    );
}
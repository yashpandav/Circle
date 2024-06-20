import React from "react";
import { useSelector } from "react-redux";
import './mainPage.css'

export default function MainCurrCircle(){

    const currClass = useSelector((state) => state.classes.currClass);

    return(
        <div className="main-curr-circle">
            <div id='class-navbar'>
                <div className="nav-item">Circle</div>
                <div className="nav-item">ClassWork</div>
                <div className="nav-item">People</div>
            </div>
            <div id="class-area">
            </div>
        </div>
    )
}
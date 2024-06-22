import React from "react";
import { useSelector } from "react-redux";
import './mainPage.css';
import CircleStaticNavbar from "./Helper/CircleStaticNavbar";

export default function MainCurrCircle() {
    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div className="main-curr-circle">
            <CircleStaticNavbar />
            <div id="class-area">
            </div>
        </div>
    );
}

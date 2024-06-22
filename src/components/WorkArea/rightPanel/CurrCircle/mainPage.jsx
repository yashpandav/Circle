import React from "react";
import { useSelector } from "react-redux";
import MainCircle from "./Helper/mainCircle";
import CircleStaticNavbar from "./Helper/CircleStaticNavbar";
import './mainPage.css';

export default function MainCurrCircle() {

    return (
        <div className="main-curr-circle">
            <CircleStaticNavbar />
            <MainCircle/>
        </div>
    );
}

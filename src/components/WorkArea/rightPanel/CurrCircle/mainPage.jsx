import React from "react";
import { useSelector } from "react-redux";
import MainCircle from "./Helper/mainCircle";
import './mainPage.css';

export default function MainCurrCircle() {

    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div className="main-curr-circle">
            
        </div>
    );
}

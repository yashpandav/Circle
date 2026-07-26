import React from "react";
import { useSelector } from "react-redux";
import MainCircle from '../../../MainCircle/mainCircle'
import CircleStaticNavbar from "../../../MainCircle/CircleStaticNavbar";
import './mainPage.css';

export default function MainCurrCircle() {
    const toggle = useSelector((state) => state.toggle.toggle);
    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div 
            className={`main-curr-circle ${!toggle ? 'main-curr-circle-toggle' : ''}`}
            style={{ '--class-theme': currClass?.classTheme || '#156f85' }}
        >
            <CircleStaticNavbar />
            <MainCircle />
        </div>
    );
}

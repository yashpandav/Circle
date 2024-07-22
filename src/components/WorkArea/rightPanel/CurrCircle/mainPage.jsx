import React from "react";
import { useSelector } from "react-redux";
import MainCircle from '../../../MainCircle/Helper/mainCircle'
import CircleStaticNavbar from "../../../MainCircle/Helper/CircleStaticNavbar";
import './mainPage.css';

export default function MainCurrCircle() {
    const toggle = useSelector((state) => state.toggle.toggle);

    return (
        <div className={`main-curr-circle ${!toggle ? 'main-curr-circle-toggle' : ''}`}>
            <CircleStaticNavbar />
            <MainCircle />
        </div>
    );
}

import React from "react";
import CircleIntroImage from "./circleIntoImage";
import { useSelector } from "react-redux";
import './mainCircle.css';

export default function MainCircle() {
    const toggle = useSelector((state) => state.toggle.toggle);

    return (
        <div className={`main-circle-area ${!toggle ? 'main-circle-toggle' : ''}`}>
            <CircleIntroImage></CircleIntroImage>
        </div>
    );
}

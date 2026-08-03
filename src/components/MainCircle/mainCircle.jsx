import React from "react";
import CircleIntroImage from "./circleIntoImage";
import MainCircleContainer from "./mainCircleContainer";
import './mainCircle.css';

export default function MainCircle() {
    return (
        <div className="main-circle-area">
            <CircleIntroImage />
            <MainCircleContainer />
        </div>
    );
}

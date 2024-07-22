import React from "react";
import CircleMainLeftContainer from "./circleMainLeftContainer";
import CircleMainRightContainer from "./circleMainRightContainer";
import './mainCircleContainer.css';

export default function MainCircleContainer() {
    return (
        <div className="main-circle-work-container">
            <CircleMainLeftContainer />
            <CircleMainRightContainer />
        </div>
    );
}
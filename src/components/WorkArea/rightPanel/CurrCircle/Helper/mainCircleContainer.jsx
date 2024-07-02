import React from "react";
import CircleMainLeftContainer from "./MainCircleAreaHelper/circleMainLeftContainer";
import CircleMainRightContainer from "./MainCircleAreaHelper/circleMainRightContainer";
import './mainCircleContainer.css';

export default function MainCircleContainer() {
    return (
        <div className="main-circle-work-container">
            <CircleMainLeftContainer />
            <CircleMainRightContainer />
        </div>
    );
}

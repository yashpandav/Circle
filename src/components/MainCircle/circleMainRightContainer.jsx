import React from "react";
import AnnouncementContainer from './MainCircleWorkingArea/announcementContainer'
import ShowPostMain from "./MainCircleWorkingArea/showPost";
import './circleMainRightContainer.css'

export default function CircleMainRightContainer() {
    return (
        <div className="main-circle-right-container">
            <AnnouncementContainer/>
            <ShowPostMain/>
        </div>
    );
}
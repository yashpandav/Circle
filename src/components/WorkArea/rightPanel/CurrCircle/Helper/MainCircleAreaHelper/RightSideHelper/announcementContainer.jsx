import React from "react";
import "./announcementContainer.css";
import { useSelector } from "react-redux";

export default function AnnouncementContainer() {
    const user = useSelector((state) => state.auth.user);
    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div className="main-announcement-container">
            <div className="announce-something-container">
                <img src={user.image} alt="user-img" className="user-img" />
                <div className="announce-content">
                    <h6 className="announce-heading" style={{
                        color : currClass.classTheme
                    }}>Announce something to your circle...</h6>
                    <p className="announce-description">
                        Share updates, announcements, or important information with your circle.
                    </p>
                </div>
            </div>
        </div>
    );
}
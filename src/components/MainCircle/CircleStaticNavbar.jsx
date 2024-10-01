import React, { useState } from "react";
import { useSelector } from "react-redux";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import "./circleStaticNav.css";

export default function CircleStaticNavbar() {
    const currClass = useSelector((state) => state.classes.currClass);
    const [activeTab, setActiveTab] = useState("Stream");

    const navItems = ["Stream", "Classwork", "People"];

    return (
        <div
            className="navbar-container"
            style={{
                borderBottom: `2px solid ${currClass.classTheme}`,
            }}
        >
            <div className="circle-navbar">
                {navItems.map((item) => (
                    <div
                        key={item}
                        className="navbar-list"
                        onClick={() => setActiveTab(item)}
                        style={{
                            backgroundColor: activeTab === item ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                        }}
                    >
                        <h3 style={{ color: activeTab === item ? currClass.classTheme : '#1a1a1a' }}>
                            {item}
                        </h3>
                    </div>
                ))}
            </div>
            <div className="navbar-setting-class">
                <SettingsOutlinedIcon className="settings-icon" />
            </div>
        </div>
    );
}
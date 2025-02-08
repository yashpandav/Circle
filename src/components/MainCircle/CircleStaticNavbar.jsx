import React, { useState , useEffect } from "react";
import { useSelector } from "react-redux";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import "./circleStaticNav.css";
import { useNavigate } from "react-router-dom";

export default function CircleStaticNavbar() {
    const currClass = useSelector((state) => state.classes.currClass);
    const currUser = useSelector((state) => state.auth.user);

    const [activeTab, setActiveTab] = useState("Stream");
    const [isAdmin , setAdmin] = useState(false);

    useEffect(() => {
        if(currUser && currClass && currUser._id === currClass.admin._id){
            setAdmin(true);
        }
    }, [currUser, currClass]);

    const navigate = useNavigate();

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
                            backgroundColor: activeTab === item ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
                        }}
                    >
                        <h3 style={{ color: activeTab === item ? currClass.classTheme : '#1a1a1a' }} onClick={() => navigate(`/workarea/circle/${currClass._id}/${item.toLowerCase()}`)}>
                            {item}
                        </h3>
                    </div>
                ))}
            </div>
            {
                isAdmin && (
                    <div className="navbar-setting-class">
                        <SettingsOutlinedIcon className="settings-icon" />
                    </div>
                )
            }
        </div>
    );
}
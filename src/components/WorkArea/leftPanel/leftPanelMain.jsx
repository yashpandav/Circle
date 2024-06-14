import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import TopicIcon from "@mui/icons-material/Topic";
import TaskIcon from "@mui/icons-material/Task";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { MdOutlineTopic } from "react-icons/md";
import { MdTask } from "react-icons/md";
import "./leftPanelMain.css";

export default function LeftMain({ togleHandler }) {
    const [visibleSubMenu1, setVisibleSubMenu1] = useState(false);
    const [visibleSubMenu2, setVisibleSubMenu2] = useState(false);
    const [menuOpen, setMenuOpen] = useState(true);
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        togleHandler();
    };

    const handleLinkClick = (path) => {
        setActiveLink(path);
    };

    return (
        <div id="left-main" className={menuOpen ? "menu-open" : "menu-closed"}>
            <span className="menu-icon-container" onClick={toggleMenu}>
                <ArrowRightIcon
                    style={{
                        transform: menuOpen ? "rotate(180deg)" : "",
                        transition: "transform 0.3s ease-in-out",
                    }}
                />
            </span>
            <div className="left-links" style={{ marginTop: "2rem" }}>
                <Link
                    to="/workarea/home"
                    onClick={() => handleLinkClick("/workarea/home")}
                    className={`left-link ${menuOpen ? "menu-open" : "menu-closed"} ${activeLink === "/workarea/home" ? "active" : ""
                        }`}
                >
                    <HomeIcon />
                    {menuOpen && <p>Home</p>}
                </Link>
            </div>
            <div className="left-links">
                <Link
                    to="/workarea/calendar"
                    onClick={() => handleLinkClick("/workarea/calendar")}
                    className={`left-link ${menuOpen ? "menu-open" : "menu-closed"} ${activeLink === "/workarea/calendar" ? "active" : ""
                        }`}
                >
                    <CalendarTodayIcon />
                    {menuOpen && <p>Calendar</p>}
                </Link>
            </div>
            {menuOpen && (
                <div className="left-links" onClick={() => setVisibleSubMenu1(!visibleSubMenu1)}>
                    <div
                        className={`left-link-main ${menuOpen ? "menu-open" : "menu-closed"
                            }`}
                    >
                        <CastForEducationIcon />
                        {menuOpen && <p>Teaching</p>}
                        <ArrowDropDownIcon
                            style={{
                                transform:
                                    visibleSubMenu1 ? "rotate(180deg)" : "",
                                transition: "transform 0.3s ease-in-out",
                            }}
                        />
                    </div>
                </div>
            )}
            {!menuOpen && (
                <div className="sub-menu">
                    <Link
                        to="/workarea/review"
                        onClick={() => handleLinkClick("/workarea/review")}
                        className={`left-link sub-menu-closed ${activeLink === "/workarea/review" ? "active" : ""
                            }`}
                    >
                        <MdOutlineTopic className="icon-closed" />
                    </Link>
                </div>
            )}
            {visibleSubMenu1 && menuOpen && (
                <div className="sub-menu">
                    <Link
                        to="/workarea/review"
                        onClick={() => handleLinkClick("/workarea/review")}
                        className={`left-link ${activeLink === "/workarea/review" ? "active" : ""
                            }`}
                    >
                        <TopicIcon />
                        <p>To Review</p>
                    </Link>
                </div>
            )}
            {menuOpen && (
                <div className="left-links" onClick={() => setVisibleSubMenu2(!visibleSubMenu2)}>
                    <div
                        className={`left-link-main ${menuOpen ? "menu-open" : "menu-closed"
                            }`}
                    >
                        <SchoolIcon />
                        {menuOpen && <p>Enrolled</p>}
                        <ArrowDropDownIcon
                            style={{
                                transform:
                                    visibleSubMenu2 ? "rotate(180deg)" : "",
                                transition: "transform 0.3s ease-in-out",
                            }}
                        />
                    </div>
                </div>
            )}
            {!menuOpen && (
                <div className="sub-menu">
                    <Link
                        to="/workarea/todo"
                        onClick={() => handleLinkClick("/workarea/todo")}
                        className={`left-link sub-menu-closed { ${activeLink === "/workarea/todo" ? "active" : ""
                            }`}
                    >
                        <MdTask className="icon-closed" />
                    </Link>
                </div>
            )}
            {visibleSubMenu2 && menuOpen && (
                <div className="sub-menu">
                    <Link
                        to="/workarea/todo" 
                        onClick={() => handleLinkClick("/workarea/todo")}
                        className={`left-link ${activeLink === "/workarea/todo" ? "active" : ""
                            }`}
                    >
                        <TaskIcon />
                        <p>To do</p>
                    </Link>
                </div>
            )}
            <div className="left-links">
                <Link
                    to="/workarea/settings"
                    onClick={() => handleLinkClick("/workarea/settings")}
                    className={`left-link ${menuOpen ? "menu-open" : "menu-closed"} ${activeLink === "/workarea/settings" ? "active" : ""
                        }`}
                >
                    <SettingsIcon
                        className="settings-icon"
                        style={{
                            marginRight: menuOpen ? "" : "6.4px",
                        }}
                    />
                    {menuOpen && <p>Settings</p>}
                </Link>
            </div>
        </div>
    );
}

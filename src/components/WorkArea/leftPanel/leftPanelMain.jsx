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
import "./leftPanelMain.css";

export default function LeftMain() {
    const [visibleSubMenu, setVisibleSubMenu] = useState(null);
    const [menuOpen, setMenuOpen] = useState(true);
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);

    const toggleSubMenu = (menu) => {
        setVisibleSubMenu(visibleSubMenu === menu ? null : menu);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLinkClick = (path) => {
        setActiveLink(path);
    };

    return (
        <div
            id="left-main"
            style={{
                transform: menuOpen ? "translateX(0)" : "translateX(-60%)",
            }}
        >
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
                    style={{
                        flexDirection: menuOpen ? "row" : "column",
                        justifyContent: menuOpen ? "flex-start" : "center",
                    }}
                    className={activeLink === "/workarea/home" ? "active" : ""}
                >
                    <HomeIcon />
                    {menuOpen && <p>Home</p>}
                </Link>
            </div>
            <div className="left-links">
                <Link
                    to="/workarea/calendar"
                    onClick={() => handleLinkClick("/workarea/calendar")}
                    className={activeLink === "/workarea/calendar" ? "active" : ""}
                    style={{
                        flexDirection: menuOpen ? "row" : "column",
                        justifyContent: menuOpen ? "flex-start" : "center",
                    }}
                >
                    <CalendarTodayIcon />
                    {menuOpen && <p>Calendar</p>}
                </Link>
            </div>
            {
                menuOpen && (
                    <div className="left-links" onClick={() => toggleSubMenu("teaching")}>
                        <div
                            className={`left-link-main`}
                            style={{
                                flexDirection: menuOpen ? "row" : "column",
                                justifyContent: menuOpen ? "flex-start" : "center",
                            }}
                        >
                            <CastForEducationIcon />
                            {menuOpen && <p>Teaching</p>}
                            <ArrowDropDownIcon
                                style={{
                                    transform: visibleSubMenu === "teaching" ? "rotate(180deg)" : "",
                                    transition: "transform 0.3s ease-in-out",
                                }}
                            />
                        </div>
                    </div>
                )
            }
            {
                !menuOpen && (
                    <div className="sub-menu">
                        <Link
                            to="/workarea/review"
                            onClick={() => handleLinkClick("/workarea/review")}
                            className={activeLink === "/workarea/review" ? "active" : ""}
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                                alignItems: "flex-end",
                            }}
                        >
                            <TopicIcon />
                        </Link>
                    </div>
                )
            }{visibleSubMenu === "teaching" && menuOpen && (
                <div className="sub-menu">
                    <Link
                        to="/workarea/review"
                        onClick={() => handleLinkClick("/workarea/review")}
                        className={activeLink === "/workarea/review" ? "active" : ""}
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                        }}
                    >
                        <TopicIcon />
                        <p>To Review</p>
                    </Link>
                </div>
            )}
            {
                menuOpen && (
                    <div className="left-links" onClick={() => toggleSubMenu("enrolled")}>
                        <div
                            className={`left-link-main`}
                            style={{
                                flexDirection: menuOpen ? "row" : "column",
                                justifyContent: menuOpen ? "flex-start" : "center",
                            }}
                        >
                            <SchoolIcon />
                            {menuOpen && <p>Enrolled</p>}
                            <ArrowDropDownIcon
                                style={{
                                    transform: visibleSubMenu === "enrolled" ? "rotate(180deg)" : "",
                                    transition: "transform 0.3s ease-in-out",
                                }}
                            />
                        </div>
                    </div>
                )
            }

            {
                !menuOpen && (
                    <div className="sub-menu">
                        <Link
                            to="/workarea/todo"
                            onClick={() => handleLinkClick("/workarea/todo")}
                            className={activeLink === "/workarea/todo" ? "active" : ""}
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                            }}
                        >
                            <TaskIcon />
                        </Link>
                    </div>
                )
            }
            {visibleSubMenu === "enrolled" && menuOpen && (
                <div className="sub-menu">
                    <Link
                        to="/workarea/todo"
                        onClick={() => handleLinkClick("/workarea/todo")}
                        className={activeLink === "/workarea/todo" ? "active" : ""}
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                        }}
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
                    className={activeLink === "/workarea/settings" ? "active" : ""}
                    style={{
                        flexDirection: menuOpen ? "row" : "column",
                        justifyContent: menuOpen ? "flex-start" : "center",
                    }}
                >
                    <SettingsIcon />
                    {menuOpen && <p>Settings</p>}
                </Link>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import CastForEducationIcon from "@mui/icons-material/CastForEducation";
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useSelector, useDispatch } from "react-redux";
import { setToggle } from "../../../Slices/toggleSlice";
import { JoinedCircleListStudent } from "./Helper/joinedCircleList";
import { JoinedCircleListTeacher } from "./Helper/joinedCircleList";
import "./leftPanelMain.css";

export default function LeftMain() {
    const [visibleSubMenu1, setVisibleSubMenu1] = useState(false);
    const [visibleSubMenu2, setVisibleSubMenu2] = useState(false);
    const location = useLocation();
    const [activeLink, setActiveLink] = useState(location.pathname);

    const toggle = useSelector((state) => state.toggle.toggle);
    const dispatch = useDispatch();

    const toggleMenu = () => {
        dispatch(setToggle(!toggle));
    };

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location.pathname]);

    const handleLinkClick = (path) => {
        setActiveLink(path);
    };

    return (
        <div id="left-main" className={toggle ? "menu-open" : "menu-closed"}>
            <span className="menu-icon-container" onClick={toggleMenu}>
                <ArrowRightIcon
                    style={{
                        transform: toggle ? "rotate(180deg)" : "",
                        transition: "transform 0.3s ease-in-out",
                    }}
                />
            </span>
            <div id='main-left-link'>
                <div className="left-links" style={{ marginTop: "2rem" }}>
                    <Link
                        to="/workarea/home"
                        onClick={() => handleLinkClick("/workarea/home")}
                        className={`left-link ${toggle ? "menu-open" : "menu-closed"} ${activeLink === "/workarea/home" ? "active" : ""
                            }`}
                    >
                        <HomeIcon />
                        {toggle && <p>Home</p>}
                    </Link>
                </div>
                <div className="left-links">
                    <Link
                        to="/workarea/calendar"
                        onClick={() => handleLinkClick("/workarea/calendar")}
                        className={`left-link ${toggle ? "menu-open" : "menu-closed"} ${activeLink === "/workarea/calendar" ? "active" : ""
                            }`}
                    >
                        <CalendarTodayIcon />
                        {toggle && <p>Calendar</p>}
                    </Link>
                </div>
                {toggle && (
                    <div className="left-links" onClick={() => setVisibleSubMenu1(!visibleSubMenu1)}>
                        <div
                            className={`left-link-main ${toggle ? "menu-open" : "menu-closed"
                                }`}
                        >
                            <CastForEducationIcon />
                            {toggle && <p>Teaching</p>}
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
                {!toggle && (
                    <div className="sub-menu">
                        <Link
                            to="/workarea/review"
                            onClick={() => handleLinkClick("/workarea/review")}
                            className={`left-link sub-menu-closed ${activeLink === "/workarea/review" ? "active" : ""
                                }`}
                        >
                            <RateReviewOutlinedIcon className="icon-closed" />
                        </Link>
                    </div>
                )}
                {visibleSubMenu1 && toggle && (
                    <div className="sub-menu">
                        <Link
                            to="/workarea/review"
                            onClick={() => handleLinkClick("/workarea/review")}
                            className={`left-link ${activeLink === "/workarea/review" ? "active" : ""
                                }`}
                        >
                            <RateReviewOutlinedIcon />
                            <p>To Review</p>
                        </Link>
                        <span className='allCircles'>
                            <JoinedCircleListTeacher />
                        </span>
                    </div>
                )}
                {toggle && (
                    <div className="left-links" onClick={() => setVisibleSubMenu2(!visibleSubMenu2)}>
                        <div
                            className={`left-link-main ${toggle ? "menu-open" : "menu-closed"
                                }`}
                        >
                            <SchoolIcon />
                            {toggle && <p>Enrolled</p>}
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
                {!toggle && (
                    <div className="sub-menu">
                        <Link
                            to="/workarea/todo"
                            onClick={() => handleLinkClick("/workarea/todo")}
                            className={`left-link sub-menu-closed { ${activeLink === "/workarea/todo" ? "active" : ""
                                }`}
                        >
                            <TaskOutlinedIcon className="icon-closed" />
                        </Link>
                    </div>
                )}
                {visibleSubMenu2 && toggle && (
                    <div className="sub-menu">
                        <Link
                            to="/workarea/todo"
                            onClick={() => handleLinkClick("/workarea/todo")}
                            className={`left-link ${activeLink === "/workarea/todo" ? "active" : ""
                                }`}
                        >
                            <TaskOutlinedIcon />
                            <p>To do</p>
                        </Link>
                        <span className='allCircles'>
                            <JoinedCircleListStudent />
                        </span>
                    </div>
                )}
                <div className="left-links">
                    <Link
                        to="/workarea/settings"
                        onClick={() => handleLinkClick("/workarea/settings")}
                        className={`left-link ${toggle ? "menu-open" : "menu-closed"} ${activeLink === "/workarea/settings" ? "active" : ""
                            }`}
                    >
                        <SettingsOutlinedIcon
                            className="settings-icon"
                            style={{
                                marginRight: toggle ? "" : "8px",
                            }}
                        />
                        {toggle && <p>Settings</p>}
                    </Link>
                </div>
            </div>
        </div>
    );
}

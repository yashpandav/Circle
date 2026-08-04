import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import CastForEducationRoundedIcon from "@mui/icons-material/CastForEducationRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Tooltip from "@mui/material/Tooltip";
import { useSelector, useDispatch } from "react-redux";
import { setToggle } from "../../../Slices/toggleSlice";
import { JoinedCircleListStudent, JoinedCircleListTeacher } from "./Helper/joinedCircleList";
import "./leftPanelMain.css";

function NavLink({ to, icon, label, toggle, activeLink }) {
    const isActive = activeLink === to;
    return (
        <Tooltip
            title={!toggle ? label : ""}
            placement="right"
            arrow
            disableHoverListener={toggle}
        >
            <Link
                to={to}
                className={`lp-link ${toggle ? "lp-link--open" : "lp-link--closed"} ${isActive ? "lp-link--active" : ""}`}
                aria-label={label}
            >
                <span className="lp-link-icon">{icon}</span>
                {toggle && <span className="lp-link-label">{label}</span>}
            </Link>
        </Tooltip>
    );
}

function SectionHeader({ icon, label, toggle, isOpen, onClick }) {
    return (
        <Tooltip
            title={!toggle ? label : ""}
            placement="right"
            arrow
            disableHoverListener={toggle}
        >
            <div
                className={`lp-section-header ${toggle ? "lp-section-header--open" : "lp-section-header--closed"} ${isOpen ? "lp-section-header--expanded" : ""}`}
                onClick={onClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onClick()}
                aria-label={label}
            >
                <span className="lp-section-icon">{icon}</span>
                {toggle && (
                    <>
                        <span className="lp-section-label">{label}</span>
                        <KeyboardArrowDownRoundedIcon
                            className={`lp-section-chevron ${isOpen ? "lp-section-chevron--rotated" : ""}`}
                        />
                    </>
                )}
            </div>
        </Tooltip>
    );
}

export default function LeftMain() {
    const [teachingOpen, setTeachingOpen] = useState(false);
    const [enrolledOpen, setEnrolledOpen] = useState(false);

    const location = useLocation();
    const activeLink = location.pathname;

    const toggle = useSelector((state) => state.toggle.toggle);
    const dispatch = useDispatch();

    const toggleMenu = () => dispatch(setToggle(!toggle));

    return (
        <div id="left-main" className={toggle ? "menu-open" : "menu-closed"}>
            {/* Collapse / Expand button */}
            <button
                type="button"
                className="lp-toggle-btn"
                onClick={toggleMenu}
                title={toggle ? "Collapse sidebar" : "Expand sidebar"}
                aria-label={toggle ? "Collapse sidebar" : "Expand sidebar"}
            >
                {toggle ? (
                    <ChevronLeftRoundedIcon className="lp-toggle-icon" />
                ) : (
                    <ChevronRightRoundedIcon className="lp-toggle-icon" />
                )}
            </button>

            <div id="main-left-link">
                {/* ── Home ─────────────────────────── */}
                <NavLink
                    to="/workarea/home"
                    icon={<HomeRoundedIcon />}
                    label="Home"
                    toggle={toggle}
                    activeLink={activeLink}
                />

                {/* ── Dashboard ────────────────────── */}
                <NavLink
                    to="/workarea/dashboard"
                    icon={<DashboardRoundedIcon />}
                    label="Dashboard"
                    toggle={toggle}
                    activeLink={activeLink}
                />

                {/* ── Teaching ─────────────────────── */}
                <SectionHeader
                    icon={<CastForEducationRoundedIcon />}
                    label="Teaching"
                    toggle={toggle}
                    isOpen={teachingOpen}
                    onClick={() => setTeachingOpen((p) => !p)}
                />

                {(teachingOpen || !toggle) && (
                    <div className={`lp-sub ${toggle ? "lp-sub--open" : "lp-sub--closed"}`}>
                        <NavLink
                            to="/workarea/review"
                            icon={<RateReviewOutlinedIcon />}
                            label="To Review"
                            toggle={toggle}
                            activeLink={activeLink}
                        />
                        {toggle && <JoinedCircleListTeacher />}
                    </div>
                )}

                {/* ── Enrolled ─────────────────────── */}
                <SectionHeader
                    icon={<SchoolRoundedIcon />}
                    label="Enrolled"
                    toggle={toggle}
                    isOpen={enrolledOpen}
                    onClick={() => setEnrolledOpen((p) => !p)}
                />

                {(enrolledOpen || !toggle) && (
                    <div className={`lp-sub ${toggle ? "lp-sub--open" : "lp-sub--closed"}`}>
                        <NavLink
                            to="/workarea/todo"
                            icon={<TaskAltRoundedIcon />}
                            label="To do"
                            toggle={toggle}
                            activeLink={activeLink}
                        />
                        {toggle && <JoinedCircleListStudent />}
                    </div>
                )}

                {/* ── Settings ─────────────────────── */}
                <NavLink
                    to="/workarea/settings"
                    icon={<SettingsRoundedIcon />}
                    label="Settings"
                    toggle={toggle}
                    activeLink={activeLink}
                />
            </div>
        </div>
    );
}

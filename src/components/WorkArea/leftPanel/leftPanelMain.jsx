import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import TopicIcon from '@mui/icons-material/Topic';
import TaskIcon from '@mui/icons-material/Task';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import './leftPanelMain.css';

export default function LeftMain() {
    const [visibleSubMenu, setVisibleSubMenu] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleSubMenu = (menu) => {
        setVisibleSubMenu(visibleSubMenu === menu ? null : menu);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div id="left-main" className={menuOpen ? 'menu-open' : ''}>
            <div className="menu-icon-container">
                <MenuIcon className="menu-icon" onClick={toggleMenu} />
            </div>
            <div className="left-links" style={{marginTop : '2rem'}}>
                <Link to="/workarea/home">
                    <HomeIcon />
                    <p>Home</p>
                </Link>
            </div>
            <div className="left-links">
                <Link to="/workarea/calendar">
                    <CalendarTodayIcon />
                    <p>Calendar</p>
                </Link>
            </div>
            <div className="left-links" onClick={() => toggleSubMenu('teaching')}>
                <div className="left-link-main">
                    <CastForEducationIcon />
                    <p>Teaching</p>
                    <ArrowDropDownIcon
                        style={{
                            transform: visibleSubMenu === 'teaching' ? 'rotate(180deg)' : '',
                            transition: 'transform 0.3s ease-in-out',
                        }}
                    />
                </div>
                {visibleSubMenu === 'teaching' && (
                    <div className="sub-menu">
                        <Link to="/workarea/review">
                            <TopicIcon />
                            <p>To Review</p>
                        </Link>
                    </div>
                )}
            </div>
            <div className="left-links" onClick={() => toggleSubMenu('enrolled')}>
                <div className="left-link-main">
                    <SchoolIcon />
                    <p>Enrolled</p>
                    <ArrowDropDownIcon
                        style={{
                            transform: visibleSubMenu === 'enrolled' ? 'rotate(180deg)' : '',
                            transition: 'transform 0.3s ease-in-out',
                        }}
                    />
                </div>
                {visibleSubMenu === 'enrolled' && (
                    <div className="sub-menu">
                        <Link to="/workarea/todo">
                            <TaskIcon />
                            <p>To do</p>
                        </Link>
                    </div>
                )}
            </div>
            <div className="left-links">
                <Link to="/workarea/settings">
                    <SettingsIcon />
                    <p>Settings</p>
                </Link>
            </div>
        </div>
    );
}

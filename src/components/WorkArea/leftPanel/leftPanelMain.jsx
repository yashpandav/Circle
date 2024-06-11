import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import TopicIcon from '@mui/icons-material/Topic';
import TaskIcon from '@mui/icons-material/Task';
import SettingsIcon from '@mui/icons-material/Settings';
import './leftPanelMain.css';

export default function LeftMain() {
    return (
        <div id="left-main">
            <div className="left-links">
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
            <div className="left-links">
                <Link to="/workarea/teaching">
                    <CastForEducationIcon />
                    <p>Teaching</p>
                </Link>
            </div>
            <div className="left-links">
                <Link to="/workarea/review">
                    <TopicIcon />
                    <p>To Review</p>
                </Link>
            </div>
            <div className="left-links">
                <Link to="/workarea/enrolled">
                    <SchoolIcon />
                    <p>Enrolled</p>
                </Link>
            </div>
            <div className="left-links">
                <Link to="/workarea/todo">
                    <TaskIcon />
                    <p>To do</p>
                </Link>
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
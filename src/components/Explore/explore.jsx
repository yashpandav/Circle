import React from 'react';
import './explore.css';
import OverAllDetails from './overalldetails';

export default function Explore() {
    return (
        <div id="explore-section">
            <OverAllDetails></OverAllDetails>
            <h2>Explore Circle</h2>
            <p>Discover the various ways you can engage with our platform.</p>
            <div id="explore-buttons">
                <div className="explore-btn">Join a Class</div>
                <div className="explore-btn">Create a Class</div>
                <div className="explore-btn">Go To StudyArea</div>
            </div>
        </div>
    );
}

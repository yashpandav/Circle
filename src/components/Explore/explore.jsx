import './explore.css';
import React from 'react';

export default function Explore() {
    return (
        <div id="explore-section">
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

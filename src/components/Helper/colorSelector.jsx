import React from "react";
import './colorSelector.css';

export default function ColorSelector({ setselectedColor, selectedColor }) {
    const colorOptions = {
        blue: '#4285f4',
        green: '#34a853',
        pink: '#ea4335',
        orange: '#fbbc05',
        teal: '#00897b',
        purple: '#7e57c2',
        'dark-red': '#800101',
        navy: '#001f3f',
        'dark-green': '#004d40',
        maroon: '#800000',
        'dark-gray': '#2f2f2f',
        indigo: '#4b0082'
    };

    const handleColorClick = (color) => {
        setselectedColor(colorOptions[color]); 
    };

    return (
        <div>
            <h4>Select theme color:</h4>
            <div className="theme-color-options">
                {Object.keys(colorOptions).map((color) => (
                    <button
                        key={color}
                        className={`color-btn ${color} ${selectedColor === colorOptions[color] ? 'selected' : ''}`}
                        onClick={() => handleColorClick(color)}
                    ></button>
                ))}
            </div>
        </div>
    );
}

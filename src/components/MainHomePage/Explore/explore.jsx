import React from 'react';
import './explore.css';
import OverAllDetails from './overalldetails.jsx';
import { Button } from '@mui/material';

const TiltedArrowSVG = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 800 800"
        width="120"
        height="130"
        id='arrow'
    >
        <g
            strokeWidth="14"
            stroke="hsl(227, 71%, 57%)"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="19 0"
            transform="matrix(0.9903,0.1392,-0.1392,0.9903,-30.4,-51.8)"
        >
            <path d="M116.5 118.96265268325806Q540.5 60.96265268325806 683.5 685.962652683258" markerEnd="url(#SvgjsMarker2265)" />
        </g>
        <defs>
            <marker
                markerWidth="9"
                markerHeight="9"
                refX="4.5"
                refY="4.5"
                viewBox="0 0 9 9"
                orient="auto"
                id="SvgjsMarker2265"
            >
                <polyline
                    points="0,4.5 4.5,2.25 0,0"
                    fill="none"
                    strokeWidth="1.5"
                    stroke="hsl(227, 71%, 57%)"
                    strokeLinecap="round"
                    transform="matrix(1,0,0,1,1.5,2.25)"
                    strokeLinejoin="round"
                />
            </marker>
        </defs>
    </svg>
);

export default function Explore() {
    return (
        <div id="explore-section">
            <OverAllDetails></OverAllDetails>
            <h2>Explore Circle</h2>
            <TiltedArrowSVG />
            <p>Discover the various ways you can engage with our platform.</p>
            <div id="explore-buttons">
                <Button variant="outlined" style={{padding : "10px 20px" , color : "#0077b1" , borderColor : "#219ebc"}}>Join Class</Button>
                <Button variant="outlined" style={{padding : "10px 20px" , color : "#0077b1" , borderColor : "#219ebc"}}>Create Class</Button>
                <Button variant="outlined" style={{padding : "10px 20px" , color : "#0077b1" , borderColor : "#219ebc"}}>Go To WorkArea</Button>
            </div>
        </div>
    );
}

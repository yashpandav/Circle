import React from "react";
import { useSelector } from "react-redux";
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import './circleIntroImage.css';

export default function CircleIntroImage() {
    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div
            className="circle-intro-image"
            style={{ backgroundImage: `url(${currClass.thumbnail})` }}
        >
            <div className="circle-content">
                <h3 className="curr-circle-name">{currClass.name}</h3>
                <InfoTwoToneIcon className="info-icon" />
            </div>
        </div>
    );
}

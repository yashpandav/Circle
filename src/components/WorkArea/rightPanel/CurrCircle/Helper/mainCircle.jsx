import React from "react";
import { useSelector } from "react-redux";
import './mainCircle.css';

export default function MainCircle() {
    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div className="main-circle-area">
            <div 
                id="curr-circle-informer"
                style={{ backgroundImage: `url(${currClass.thumbnail})` }}
            >
                <h3 id="curr-circle-name">{currClass.name}</h3>
            </div>
        </div>
    );
}
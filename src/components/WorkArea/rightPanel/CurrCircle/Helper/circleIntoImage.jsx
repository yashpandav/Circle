import React from "react";
import { useSelector } from "react-redux";
import './cirleIntroImage.css'

export default function CircleIntroImage() {
    const currClass = useSelector((state) => state.classes.currClass);

    return (
        <div
            id="curr-circle-informer"
            style={{ backgroundImage: `url(${currClass.thumbnail})`}}
        >
            <h3 id="curr-circle-name">{currClass.name}</h3>
        </div>
    )
}
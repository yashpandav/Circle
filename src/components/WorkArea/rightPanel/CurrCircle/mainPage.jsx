import React from "react";
import { useSelector } from "react-redux";

export default function MainCurrCircle(){

    const currClass = useSelector((state) => state.classes.currClass)
    console.log("currClass" , currClass);
    
    return <div>Main Current Circle</div>;
}
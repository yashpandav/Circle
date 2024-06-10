import React from "react"
import { Link } from "react-router-dom"

export default function LoGo() {
    return (
        <div id="logo">
            <Link to="/">
                <img
                    src={require("../../Data/Images/logo.png")}
                    alt="imgLogo"
                    id="logo-img"
                ></img>
            </Link>
            <Link to="/">
                <h2>Circle</h2>
            </Link>
        </div>

    )
}
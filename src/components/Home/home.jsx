import React from "react";
import "./home.css";
import { CgQuote } from "react-icons/cg";
import { TypeAnimation } from "react-type-animation";
import ScrollAnimation from "react-animate-on-scroll";

export default function Home() {
    return (
        <div className="main-home">
            <div id="left-home">
                <div id='home-left-text'>
                    <h1>Where Learning Comes Full Circle</h1>
                    <p>
                        <CgQuote />
                        At Circle, we believe education is a journey best taken together. Our
                        platform brings students and teachers into a collaborative space where
                        learning truly comes full circle.
                        <CgQuote />
                    </p>
                </div>
                <div id='home-left-btn'>
                    <button type="button" className="btn btn-primary">
                        Join Class
                    </button>
                    <div id='straightLin'></div>
                    <div id='create-class-home-btn'>
                        Create Class
                    </div>
                </div>
            </div>

            <div id="right-home">
                <img
                    src={require("../../Data/Images/5836.png")}
                    alt="homeImg"
                    id="home-img"
                ></img>
            </div>
        </div>
    );
}




{/* <TypeAnimation
                    sequence={[
                        'Where Learning Comes Full Circle'
                    ]}
                    repeat={Infinity}
                    wrapper="h1"
                    speed={50}
                    cursor={false}
                    deletionSpeed={50}
                /> */}
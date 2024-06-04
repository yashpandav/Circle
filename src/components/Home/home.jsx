import React from "react";
import "./home.css";
import { CgQuote } from "react-icons/cg";
import { TypeAnimation } from 'react-type-animation';

export default function Home() {
    return (
        <div className="main-home">
            <div id="left-home">
                <TypeAnimation
                    sequence={[
                        'Where Learning Comes Full Circle'
                    ]}
                    repeat={Infinity}
                    omitDeletionAnimation={true}
                    wrapper="h1"
                    speed={50}
                    style={{ fontSize: '2em', display: 'inline-block' }}
                    cursor={false}
                />
                <p>
                    <CgQuote />
                    At Circle, we believe education is a journey best taken together. Our
                    platform brings students and teachers into a collaborative space where
                    learning truly comes full circle.
                    <CgQuote />
                </p>
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

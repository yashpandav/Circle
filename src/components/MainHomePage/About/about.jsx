import WhyWeSection from "./whyweCard";
import "./about.css";
import React from "react";
export default function About() {
    return (
        <div id="about-us">
            <h2>Welcome to Circle</h2>
            <p id='about-us-p'>
                A revolutionary platform designed to transform the educational
                experience. At Circle, we believe in the power of collaborative
                learning, where teachers and students can come together in a dynamic and
                interactive environment. Our mission is to create a space where
                education is not just a process, but a shared journey.
            </p>
            <h4>Fit-for-purpose solutions</h4>
            <WhyWeSection></WhyWeSection>
        </div>
    );
}
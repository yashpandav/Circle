import { MdOutlineSettingsAccessibility } from "react-icons/md";
import { BsPeopleFill } from "react-icons/bs";
import { FaHandsHelping } from "react-icons/fa";
import React from "react";
import './whyweCard.css'

export const WhyWe = [
    {
        image: <MdOutlineSettingsAccessibility />,
        heading: "Provide a Personalized Learning Hub",
        description:
            "Connect students, families, teachers, and the community to learning across your entire district. Circle is a one-stop-platform for educators to personalize your district's curriculum as per need.",
    },
    {
        image: <FaHandsHelping />,
        heading: "Easy To Work",
        description:
            "Circle makes educators lives easier by helping them easily create high-quality assignments and instructional content. Students benefit from an always-available personalized assistant to support them in the way they choose to learn.",
    },
    {
        image: <BsPeopleFill />,
        heading: "Supportive Community",
        description:
        "Join a community of learners and educators who are passionate about education and eager to support each other. Together, we foster an environment where everyone can thrive and grow.",
    },
];  


const WhyWeSection = () => {
    return (
        <section id="why-we">
            <div id="why-we-cards">
                {WhyWe.map((item, index) => (
                    <div className="why-we-card" key={index}>
                        <div className="why-we-icon">{item.image}</div>
                        <h3>{item.heading}</h3>
                        <p>{item.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WhyWeSection;
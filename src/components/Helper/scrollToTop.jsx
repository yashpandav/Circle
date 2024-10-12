import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import "./scrollToTop.css";
import { IconButton } from "@mui/material";

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            {isVisible && (
                <buton onClick={scrollToTop} className="scroll-to-top">
                    <FaArrowUp />
                </buton>
            )}
        </>
    );
};

export default ScrollToTop;

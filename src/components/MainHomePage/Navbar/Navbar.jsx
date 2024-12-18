import React from "react";
import Scrollspy from "react-scrollspy";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import SignUp from "../../AuthPages/signup";
import { useSelector } from "react-redux";
import UserInfo from "./Helper/userInfo";
import LoGo from "../../Helper/logo";
import "./Navbar.css";

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    return (
        <div className="main-navbar" id="main-navbar">
            <LoGo id="logo"></LoGo>
            <nav id="nav">
                <Scrollspy
                    items={["home", "about", "explore"]}
                    currentClassName="is-current"
                    offset={-50}
                    componentTag={"ul"}
                    id="scrollspy"
                >
                    <li id="li">
                        <ScrollLink to="home" smooth={true} duration={500} offset={-45} id="home-link">
                            Home
                        </ScrollLink>
                    </li>
                    <li id="li">
                        <ScrollLink to="about" smooth={true} duration={500} offset={-45} id="about-link">
                            About
                        </ScrollLink>
                    </li>
                    <li id="li">
                        <ScrollLink to="explore" smooth={true} duration={500} offset={-45} id="explore-link">
                            Explore
                        </ScrollLink>
                    </li>
                    <li id="li">
                        <Link to="/workarea" id="workarea-link">WorkArea</Link>
                    </li>
                </Scrollspy>
                {
                    user ? (
                        <UserInfo id="user-info"></UserInfo>
                    ) : (
                        <div className="btns" id="btns">
                            <Link to="auth/login" id="login-link">
                                <Button
                                    variant="outlined"
                                    style={{ color: "#11706d", border: "green", fontSize: "1.14vw" }}
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link to="/auth/signup" element={<SignUp></SignUp>} id="signup-link">
                                <button id="signup-btn">SignUp</button>
                            </Link>
                        </div>
                    )
                }
            </nav>
        </div>
    );
};

export default Navbar;

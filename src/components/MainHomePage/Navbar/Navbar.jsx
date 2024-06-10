import React from "react";
import Scrollspy from "react-scrollspy";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import SignUp from "../../AuthPages/signup";
import { useSelector } from "react-redux";
import UserInfo from "./Helper/userInfo";
import "./Navbar.css";

const Navbar = () => {

    const { setUser, setLoggedIn } = useSelector((state) => state.auth);
    console.log("USER", setUser);
    console.log("LOGGEDIN", setLoggedIn);

    return (
        <div className="main-navbar">
            <div id="logo">
                <Link to="/home">
                    <img
                        src={require("../../../Data/Images/logo.png")}
                        alt="imgLogo"
                        id="logo-img"
                    ></img>
                </Link>
                <Link to="/home">
                    <h2>Circle</h2>
                </Link>
            </div>
            <nav>
                <Scrollspy
                    items={["home", "about", "explore"]}
                    currentClassName="is-current"
                    offset={-50}
                    componentTag={"ul"}
                >
                    <li>
                        <ScrollLink to="home" smooth={true} duration={500} offset={-50}>
                            Home
                        </ScrollLink>
                    </li>
                    <li>
                        <ScrollLink to="about" smooth={true} duration={500} offset={-50}>
                            About
                        </ScrollLink>
                    </li>
                    <li>
                        <ScrollLink to="explore" smooth={true} duration={500} offset={-50}>
                            Explore
                        </ScrollLink>
                    </li>
                    <li>
                        <Link to="class">WorkArea</Link>
                    </li>
                </Scrollspy>
                {
                    setUser ? (
                        <UserInfo setUser = {setUser}></UserInfo>
                    ) : (
                        <div className="btns">
                            <Link to="auth/login">
                                <Button
                                    variant="outlined"
                                    style={{ color: "#11706d", border: "green", fontSize: "1.14vw" }}
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link to="/auth/signup" element={<SignUp></SignUp>}>
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

import React from "react";
import Scrollspy from "react-scrollspy";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { Button } from "@mui/material";
import SignUp from "../../AuthPages/signup";
import { useSelector } from "react-redux";
import { useState } from "react";

const Navbar = () => {

    const { setUser, setLoggedIn } = useSelector((state) => state.auth);
    console.log("USER", setUser);
    console.log("LOGGEDIN", setLoggedIn);

    const [showDialog , setDialog] = useState(false);

    function dialogHandler() {
        console.log(showDialog);
        setDialog(!showDialog);
    }

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
                        <div id="user" onMouseLeave={() => {setDialog(false)}}>
                            <img src={setUser.image} alt='user-img' id='user-img' onClick={dialogHandler}>
                            </img>
                            {
                                showDialog ? (
                                    <div id = 'user-dialog'>
                                        <h1>USER DIALOG</h1>
                                    </div>
                                ) : <></>
                            }

                        </div>
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

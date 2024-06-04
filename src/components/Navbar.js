import React from 'react';
import Scrollspy from 'react-scrollspy';
import { Link as ScrollLink } from 'react-scroll';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { Button } from '@mui/material';

const Navbar = () => {
    return (
        <div className='main-navbar'>
            <div id="logo">
                <Link to="/home">
                    <img src={require('../Data/Images/logo.png')} alt='imgLogo' id='logo-img'></img>
                </Link>
                <Link to="/home">
                    <h2>Circle</h2>
                </Link>
            </div>
            <nav>
                <Scrollspy
                    items={['home', 'whywe', 'tutorial', 'explore']}
                    currentClassName="is-current"
                    offset={-50}
                    componentTag={'ul'}
                >
                    <li>
                        <ScrollLink to="home" smooth={true} duration={500} offset={-50}>
                            Home
                        </ScrollLink>
                    </li>
                    <li>
                        <ScrollLink to="whywe" smooth={true} duration={500} offset={-50}>
                            Why We
                        </ScrollLink>
                    </li>
                    <li>
                        <ScrollLink to="tutorial" smooth={true} duration={500} offset={-50}>
                            Tutorial
                        </ScrollLink>
                    </li>
                    <li>
                        <ScrollLink to="explore" smooth={true} duration={500} offset={-50}>
                            Explore
                        </ScrollLink>
                    </li>
                </Scrollspy>
                <div className='btns'>
                    <button className='btn'>
                    Log In
                    </button>
                    <button className='btn'>
                    SignUp
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;

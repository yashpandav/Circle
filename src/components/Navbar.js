// src/components/Navbar.js
import React from 'react';
import Scrollspy from 'react-scrollspy';
import { ScrollLink } from 'react-scroll';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav>
            <Scrollspy
                items={['home', 'whywe', 'tutorial' , 'explore']}
                currentClassName="is-current"
                offset={-50}
            >
                <li>
                    <Link to='/home'>
                        <img id='logo-img' src={require('../Data/Images/learning-institute-academy-logo-design_679782-84.jpg')}></img>
                    </Link>
                </li>
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
        </nav>
    );
};

export default Navbar;

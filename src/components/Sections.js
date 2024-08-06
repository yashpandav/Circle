import React from 'react';
import Home from './MainHomePage/Home/home';
import About from './MainHomePage/About/about';
import Explore from './MainHomePage/Explore/explore';

const Sections = () => {
    return (
        <>
            <div id='home'>
                <Home />
            </div>
            <div id='about'>
                <About />
            </div>
            <div id='explore'>
                <Explore />
            </div>
        </>
    );
};

export default Sections;

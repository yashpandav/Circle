import React from 'react';
import Home from './Home/home';
import About from './About/about';
import Explore from './Explore/explore';
const Sections = () => {
    return (
        <div>
            <div id='home'>
                <Home/>
            </div>
            <div id = 'about'>
                <About/>
            </div>
            <div id = 'explore'>
                <Explore/>
            </div>
        </div>
    );
};

export default Sections;

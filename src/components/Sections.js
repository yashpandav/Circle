import React from 'react';
import Home from './Home/home';
import About from './About/about';

const Sections = () => {
    return (
        <div>
            <div id='home'>
                <Home/>
            </div>
            <div id = 'about'>
                <About/>
            </div>
        </div>
    );
};

export default Sections;

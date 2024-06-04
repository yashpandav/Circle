import React from 'react';

const Sections = () => {
    return (
        <div>
            <section id="home" style={{ height: '100vh', backgroundColor: 'lightblue' }}>
                <h1>Home</h1>
            </section>
            <section id="whywe" style={{ height: '100vh', backgroundColor: 'lightcoral' }}>
                <h1>Why We</h1>
            </section>
            <section id="tutorial" style={{ height: '100vh', backgroundColor: 'lightgreen' }}>
                <h1>Tutorial</h1>
            </section>
            <section id="explore" style={{ height: '100vh', backgroundColor: 'blue' }}>
                <h1>Explore</h1>
            </section>
        </div>
    );
};

export default Sections;

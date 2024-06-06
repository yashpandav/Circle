import React from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Sections from './components/Sections';
import Footer from './components/Footer/footer';
import { ParallaxProvider } from 'react-scroll-parallax';

const App = () => {
  return (
    <ParallaxProvider>
      <div>
        <Navbar />
        <Sections/>
        <Footer/>
      </div>
    </ParallaxProvider>
  );
};

export default App;

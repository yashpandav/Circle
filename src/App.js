import React from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Sections from './components/Sections';
import Footer from './components/Footer/footer';
const App = () => {
  return (
    <div>
      <Navbar />
      <Sections/>
      <Footer/>
    </div>
  );
};

export default App;

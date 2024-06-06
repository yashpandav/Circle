// src/App.js
import React from 'react';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import Sections from './components/Sections';
import GetClass from './components/temp';

const App = () => {
  return (
    <div>
      <Navbar />
      <Sections/>
      <GetClass/>
    </div>
  );
};

export default App;

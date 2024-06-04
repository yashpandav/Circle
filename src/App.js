// src/App.js
import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sections from './components/Sections';

const App = () => {
  return (
    <div>
      <Navbar />
      <Sections/>
    </div>
  );
};

export default App;

import React from 'react';
import './App.css';
import MainHomePage from './components/MainHomePage/MainHomePage';
import Signup from './components/AuthPages/signup';
import { Routes, Route } from 'react-router-dom';
import OtpPage from './components/AuthPages/otppage'
  
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainHomePage />}></Route>
      <Route path="/home" element={<MainHomePage />}></Route>
      <Route path="/auth/signup" element={<Signup />}></Route>
      <Route path='/auth/otp' element={<OtpPage />}></Route>
      {/* <Route path="/login" element={<Login/>}></Route> */}
    </Routes>
  );    
};

export default App;

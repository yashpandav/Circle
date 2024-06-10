import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainHomePage from './components/MainHomePage/MainHomePage';
import Signup from './components/AuthPages/signup';
import Login from './components/AuthPages/login';
import OtpPage from './components/AuthPages/otppage'
import './App.css';


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainHomePage />}></Route>
      <Route path="/home" element={<MainHomePage />}></Route>
      <Route path="/auth/signup" element={<Signup />}></Route>
      <Route path='/auth/otp' element={<OtpPage />}></Route>
      <Route path='/auth/login' element={<Login />}></Route>
      <Route path="*" element={<MainHomePage />} />
    </Routes>
  );    
};

export default App;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainHomePage from './components/MainHomePage/MainHomePage';
import Signup from './components/AuthPages/signup';
import Login from './components/AuthPages/login';
import OtpPage from './components/AuthPages/otppage';
import WorkArea from './components/WorkArea/workarea';
import HomeCircle from './components/WorkArea/rightPanel/Home/home';
import Review from './components/WorkArea/rightPanel/ReviewList/review';
import Todo from './components/WorkArea/rightPanel/ToDo/todo';
import { useSelector } from 'react-redux';
import './App.css';

const App = () => {
  const { setLoggedIn } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<MainHomePage />} />
      <Route path="/home" element={<MainHomePage />} />
      <Route path="/auth/signup" element={setLoggedIn ? <Navigate to="/workarea" /> : <Signup />} />
      <Route path="/auth/login" element={setLoggedIn ? <Navigate to="/workarea" /> : <Login />} />
      <Route path="/auth/otp" element={<OtpPage />} />
      <Route path="/workarea" element={<WorkArea />}>
        <Route path='home' element={<HomeCircle />} />
        <Route path='review' element={<Review/>} />
        <Route path='todo' element={<Todo />} />
      </Route>
      <Route path="*" element={<MainHomePage />} />
    </Routes>
  );
};

export default App;

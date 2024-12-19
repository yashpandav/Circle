import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { validateLogin } from './Api/apiCaller/authapicaller';
import MainHomePage from './components/MainHomePage/MainHomePage';
import Signup from './components/AuthPages/signup';
import Login from './components/AuthPages/login';
import OtpPage from './components/AuthPages/otppage';
import WorkArea from './components/WorkArea/workarea';
import HomeCircle from './components/WorkArea/rightPanel/Home/home';
import Review from './components/WorkArea/rightPanel/ReviewList/review';
import Todo from './components/WorkArea/rightPanel/ToDo/todo';
import MainCurrCircle from './components/WorkArea/rightPanel/CurrCircle/mainPage';
import ScrollToTop from './components/Helper/scrollToTop';
import ForgotPassword from './components/AuthPages/ForgotPassword';
import './App.css';

const App = () => {
  const { login } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const relogin = () => {
      const token = Cookies.get('token');
      if (token && !login) {
        //* CALL API FOR AUTO LOGIN
        dispatch(validateLogin({ dispatch, navigate }));
      }
    };
    relogin();
  }, [login]);

  return (
    <><Routes>
      <Route path="/" element={<MainHomePage />} />
      <Route path="/auth/signup" element={login ? <Navigate to="/workarea/home" /> : <Signup />} />
      <Route path="/auth/login" element={login ? <Navigate to="/workarea/home" /> : <Login />} />
      <Route path="/auth/forgot-password" element={login ? <Navigate to="/workarea/home" /> : <ForgotPassword />} />
      <Route path="/auth/otp" element={<OtpPage />} />
      <Route path="/workarea" element={<WorkArea />}>
        <Route path="" element={<Navigate to="home" />} />
        <Route path="home" element={<HomeCircle />} />
        <Route path="circle/:id" element={<MainCurrCircle />} />
        <Route path="review" element={<Review />} />
        <Route path="todo" element={<Todo />} />
      </Route>
      <Route path="*" element={<MainHomePage />} />
    </Routes><ScrollToTop /></>
  );
};

export default App;

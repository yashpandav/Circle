import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import MainHomePage from './components/MainHomePage/MainHomePage';
// import Signup from './components/AuthPages/signup';
// import Login from './components/AuthPages/login';
// import OtpPage from './components/AuthPages/otppage';
// import WorkArea from './components/WorkArea/workarea';
// import HomeCircle from './components/WorkArea/rightPanel/Home/home';
// import Review from './components/WorkArea/rightPanel/ReviewList/review';
// import Todo from './components/WorkArea/rightPanel/ToDo/todo';
// import MainCurrCircle from './components/WorkArea/rightPanel/CurrCircle/mainPage';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { validateLogin } from './Api/apiCaller/authapicaller';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from "react-error-boundary";
import './App.css';

const MainHomePage = lazy(() => import('./components/MainHomePage/MainHomePage'));
const Signup = lazy(() => import( './components/AuthPages/signup'));
const Login = lazy(() => import('./components/AuthPages/login'));
const OtpPage = lazy(() => import('./components/AuthPages/otppage'));
const WorkArea = lazy(() => import('./components/WorkArea/workarea'));
const HomeCircle = lazy(() => import('./components/WorkArea/rightPanel/Home/home'));
const Review = lazy(() => import('./components/WorkArea/rightPanel/ReviewList/review'));
const Todo = lazy(() => import('./components/WorkArea/rightPanel/ToDo/todo'));
const MainCurrCircle = lazy(() => import('./components/WorkArea/rightPanel/CurrCircle/mainPage'));

const App = () => {
  const { login } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const relogin = () => {
      const token = Cookies.get('token');
      // console.log("TOKEN IN APP: ", token);

      if (token && !login) {
        //* CALL API FOR AUTO LOGIN
        dispatch(validateLogin({ dispatch, navigate }));
      }
    };
    relogin();
  }, [login]);


  return (
    <ErrorBoundary fallback={<h1>Something Went Wrong</h1>}>
      <Suspense fallback={<h1>Loading.....</h1>}>
        <Routes>
          <Route path="/" element={<MainHomePage />} />
          <Route path="/auth/signup" element={login ? <Navigate to="/workarea/home" /> : <Signup />} />
          <Route path="/auth/login" element={login ? <Navigate to="/workarea/home" /> : <Login />} />
          <Route path="/auth/otp" element={<OtpPage />} />
          <Route path="/workarea" element={<WorkArea />}>
            <Route path="" element={<Navigate to="home" />} />
            <Route path="home" element={<HomeCircle />} />
            <Route path="circle/:id" element={<MainCurrCircle />} />
            <Route path="review" element={<Review />} />
            <Route path="todo" element={<Todo />} />
          </Route>
          <Route path="*" element={<MainHomePage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
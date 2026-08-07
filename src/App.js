import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { validateLogin } from './Api/apiCaller/authapicaller';
import { resetAuth } from './Slices/authSlice';
import { isTokenValid } from './Api/apiconfig';
import ScrollToTop from './components/Helper/scrollToTop';
import SocketProvider from './socket/SocketProvider';
import './App.css';

// Lazy loaded page components for optimal bundle splitting
const MainHomePage = lazy(() => import('./components/MainHomePage/MainHomePage'));
const Signup = lazy(() => import('./components/AuthPages/signup'));
const Login = lazy(() => import('./components/AuthPages/login'));
const OtpPage = lazy(() => import('./components/AuthPages/otppage'));
const ForgotPassword = lazy(() => import('./components/AuthPages/ForgotPassword'));
const WorkArea = lazy(() => import('./components/WorkArea/workarea'));
const HomeCircle = lazy(() => import('./components/WorkArea/rightPanel/Home/home'));
const Review = lazy(() => import('./components/WorkArea/rightPanel/ReviewList/review'));
const Todo = lazy(() => import('./components/WorkArea/rightPanel/ToDo/todo'));
const MainCurrCircle = lazy(() => import('./components/WorkArea/rightPanel/CurrCircle/mainPage'));
const MainCircle = lazy(() => import('./components/MainCircle/mainCircle'));
const People = lazy(() => import('./components/People/People'));
const Classwork = lazy(() => import('./components/MainCircle/Classwork/Classwork'));
const AssignmentDetails = lazy(() => import('./components/MainCircle/AssignmentDetails/AssignmentDetails'));
const Dashboard = lazy(() => import('./components/WorkArea/rightPanel/Dashboard/dashboard'));

const PageLoaderFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    width: '100%'
  }}>
    <span className="loader"></span>
  </div>
);

const App = () => {
  const { login, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Auto-login validation on load or token expiry check
  useEffect(() => {
    const relogin = () => {
      const token = Cookies.get('token');
      if (token) {
        if (!isTokenValid(token)) {
          Cookies.remove('token', { path: '/' });
          dispatch(resetAuth());
          navigate('/auth/login');
          toast.error("Session expired after 1 day. Please login again.", { id: 'session-expired-toast' });
          return;
        }
        if (!user) {
          //* CALL API FOR AUTO LOGIN
          dispatch(validateLogin({ dispatch, navigate }));
        }
      } else if (login) {
        dispatch(resetAuth());
      }
    };
    relogin();
  }, [user, login, dispatch, navigate]);

  // 2. Global session expired event listener from API interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(resetAuth());
      navigate('/auth/login');
      toast.error("Session expired. Please login again.", { id: 'session-expired-toast' });
    };

    window.addEventListener('circle:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('circle:session_expired', handleSessionExpired);
    };
  }, [dispatch, navigate]);

  // 3. Periodic session expiration check (every 60 seconds) for idle tabs
  useEffect(() => {
    const checkTokenPeriodically = () => {
      const token = Cookies.get('token');
      if (token && !isTokenValid(token)) {
        Cookies.remove('token', { path: '/' });
        dispatch(resetAuth());
        navigate('/auth/login');
        toast.error("Session expired after 1 day of inactivity. Please login again.", { id: 'session-expired-toast' });
      }
    };

    const interval = setInterval(checkTokenPeriodically, 60000);
    return () => clearInterval(interval);
  }, [dispatch, navigate]);

  return (
    <SocketProvider>
      <Suspense fallback={<PageLoaderFallback />}>
        <Routes>
          <Route path="/" element={<MainHomePage />} />
          <Route path="/auth/signup" element={login ? <Navigate to="/workarea/home" /> : <Signup />} />
          <Route path="/auth/login" element={login ? <Navigate to="/workarea/home" /> : <Login />} />
          <Route path="/auth/forgot-password" element={login ? <Navigate to="/workarea/home" /> : <ForgotPassword />} />
          <Route path="/auth/otp" element={<OtpPage />} />
          <Route path="/workarea" element={<WorkArea />}>
            <Route path="" element={<Navigate to="home" />} />
            <Route path="home" element={<HomeCircle />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="circle/:id" element={<MainCurrCircle />}>
              <Route path="" element={<Navigate to="stream" replace />} />
              <Route path="stream" element={<MainCircle />} />
              <Route path="classwork" element={<Classwork />} />
              <Route path="people" element={<People />} />
              <Route path="assignment/:assignmentId" element={<AssignmentDetails />} />
            </Route>
            <Route path="review" element={<Review />} />
            <Route path="todo" element={<Todo />} />
          </Route>
          <Route path="*" element={<MainHomePage />} />
        </Routes>
        <ScrollToTop />
      </Suspense>
    </SocketProvider>
  );
};

export default App;

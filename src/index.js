import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import rootReducer from './Reducer';
import { Toaster } from 'react-hot-toast';
const store = configureStore({
    reducer: rootReducer,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
            <Toaster
                position="bottom-center"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                    className: 'global-toast',
                    duration: 4000,
                    style: {
                        fontFamily: '"Josefin Sans", sans-serif',
                        background: '#1e293b',
                        color: '#f8fafc',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        fontSize: '1rem',
                        fontWeight: '500',
                        letterSpacing: '0.3px',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#00a896',
                            secondary: '#ffffff',
                        },
                        style: {
                            borderLeft: '5px solid #00a896',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff',
                        },
                        style: {
                            borderLeft: '5px solid #ef4444',
                        },
                    },
                }}
            />
        </BrowserRouter>
    </Provider>
);
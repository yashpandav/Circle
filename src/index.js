import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import rootReducer from './Reducer';
import { thunk } from 'redux-thunk';

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store = {store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
);
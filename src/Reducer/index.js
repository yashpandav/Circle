import { combineReducers } from 'redux';
import authReducer from '../Slices/authSlice';
import classReducer from '../Slices/classSlice';
import toggleReducer from '../Slices/toggleSlice';
import loadingReducer from '../Slices/loadingSlice';
import todoReducer from '../Slices/todoSlice';
import reviewReducer from '../Slices/reviewSlice';

const rootReducer = combineReducers({
    auth: authReducer,
    classes: classReducer,
    toggle: toggleReducer,
    loading: loadingReducer,
    todo: todoReducer,
    review: reviewReducer,
});

export default rootReducer;
import { combineReducers } from 'redux';
import authReducer from '../Slices/authSlice'
import classReducer from '../Slices/classSlice';
import toggleReducer from '../Slices/toggleSlice';

const rootReducer = combineReducers({
    auth : authReducer,
    classes : classReducer,
    toggle : toggleReducer
})

export default rootReducer;
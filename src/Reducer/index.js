import { combineReducers } from 'redux';
import authReducer from '../Slices/authSlice'
import classReducer from '../Slices/classSlice';
import toggleReducer from '../Slices/toggleSlice';
import loadingReducer from '../Slices/loadingSlice';

const rootReducer = combineReducers({
    auth : authReducer,
    classes : classReducer,
    toggle : toggleReducer,
    loading : loadingReducer
})

export default rootReducer;
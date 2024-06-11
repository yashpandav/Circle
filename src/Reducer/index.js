import { combineReducers } from 'redux';
import authReducer from '../Slices/authSlice'
import classReducer from '../Slices/classSlice';

const rootReducer = combineReducers({
    auth : authReducer,
    classes : classReducer
})

export default rootReducer;
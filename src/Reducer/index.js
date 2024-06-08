import { combineReducers } from 'redux';
import authReducer from '../Slices/authSlice'

const rootReducer = combineReducers({
    auth : authReducer
})

export default rootReducer;
import { SnippetFolderRounded } from "@mui/icons-material";
import { createSlice } from "@reduxjs/toolkit"; 
import Cookies from 'js-cookie';


const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: Cookies.get('token') || null,
        login: false,
        forgotPasswordValidity : false
    },
    reducers: {
        setUser(state , value){
            // console.log("VALUE IN SLICE   " , value.payload);
            state.user = value.payload;
            // console.log(state.setUser);
            // console.log(state.setUser._id)
        },
        setLoggedIn(state, value){
            state.login = value.payload;
            // console.log(state.setLoggedIn);
        },
        setToken(state, value){
            state.token = value.payload;
        },
        setForgotPasswordValidity(state, value){
            state.forgotPasswordValidity = value.payload;
        }
    }
})

export const { setUser , setLoggedIn , setToken , setForgotPasswordValidity } = authSlice.actions;
export default authSlice.reducer
import { createSlice } from "@reduxjs/toolkit"; 

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        login: false,
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
        }
    }
})

export const { setUser , setLoggedIn } = authSlice.actions;
export default authSlice.reducer
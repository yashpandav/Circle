import { createSlice } from "@reduxjs/toolkit"; 

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null
    },
    reducers: {
        setUser(state , value){
            console.log("VALUE IN SLICE   " , value.payload);
            state.setUser = value.payload;
            console.log(state.setUser);
            console.log(state.setUser._id)
        }
    }
})

export const { setUser } = authSlice.actions;
export default authSlice.reducer
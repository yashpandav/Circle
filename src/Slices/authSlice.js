import { createSlice } from "@reduxjs/toolkit"; 

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null
    },
    reducers: {
        setUser(state , value){
            state.setUser = value.payload;
        }
    }
})

export const { setUser } = authSlice.actions;
export default authSlice.reducer
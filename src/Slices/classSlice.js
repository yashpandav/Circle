// classSlice.js
import { createSlice } from "@reduxjs/toolkit";

const classSlice = createSlice({
    name: 'class',
    initialState: {
        joinedClasses: null,
        createdClasses: null,
        isLoading: false,
    },
    reducers: {
        setJoinedClass(state, action) {
            state.joinedClasses = action.payload;
            state.isLoading = false; 
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        }
    }
});

export const { setJoinedClass, setLoading } = classSlice.actions;
export default classSlice.reducer;

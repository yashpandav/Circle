// classSlice.js
import { createSlice } from "@reduxjs/toolkit";

const classSlice = createSlice({
    name: 'class',
    initialState: {
        joinedClassesAsTeacher: null,
        joinedClassesAsStudent: null,
        createdClasses: null,
        isLoading: false,
    },
    reducers: {
        setJoinedClassTeacher(state, action) {
            state.joinedClassesAsTeacher = action.payload;
            state.isLoading = false; 
        },
        setJoinedClassStudent(state, action) {
            state.joinedClassesAsStudent = action.payload;
            state.isLoading = false; 
        },
        setCreatedClass(state, action) {
            state.createdClasses = action.payload;
            state.isLoading = false; 
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        }
    }
});

export const { setJoinedClassTeacher , setJoinedClassStudent , setCreatedClass , setLoading } = classSlice.actions;
export default classSlice.reducer;

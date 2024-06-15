import { createSlice } from "@reduxjs/toolkit";

const classSlice = createSlice({
    name: 'class',
    initialState: {
        joinedClassesAsTeacher: null,
        joinedClassesAsStudent: null,
        createdClasses: null,
    },
    reducers: {
        setJoinedClassTeacher(state, action) {
            state.joinedClassesAsTeacher = action.payload;
        },
        setJoinedClassStudent(state, action) {
            state.joinedClassesAsStudent = action.payload;
        },
        setCreatedClass(state, action) {
            state.createdClasses = action.payload;
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        }
    }
});

export const { setJoinedClassTeacher , setJoinedClassStudent , setCreatedClass , setLoading } = classSlice.actions;
export default classSlice.reducer;

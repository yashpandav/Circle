import { createSlice } from "@reduxjs/toolkit";

const classSlice = createSlice({
    name: 'class',
    initialState: {
        joinedClassesAsTeacher: null,
        joinedClassesAsStudent: null,
        createdClasses: null,
        currClass : null,
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
        setCurrClass(state, action) {
            state.currClass = action.payload;
        },
    }
});

export const { setJoinedClassTeacher , setJoinedClassStudent , setCreatedClass , setCurrClass } = classSlice.actions;
export default classSlice.reducer;

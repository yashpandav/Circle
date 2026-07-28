import { createSlice } from "@reduxjs/toolkit";

const classSlice = createSlice({
    name: 'class',
    initialState: {
        joinedClassesAsTeacher: null,
        joinedClassesAsStudent: null,
        createdClasses: null,
        currClass: null,
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
        updateCurrClass(state, action) {
            if (state.currClass) {
                state.currClass = { ...state.currClass, ...action.payload };
            }
        },
        addClassMember(state, action) {
            if (state.currClass) {
                const { type, user } = action.payload; // type can be 'teacher' or 'student'
                if (type === 'teacher' && state.currClass.teacher) {
                    state.currClass.teacher.push(user);
                } else if (type === 'student' && state.currClass.student) {
                    state.currClass.student.push(user);
                }
            }
        },
        removeClassMember(state, action) {
            if (state.currClass) {
                const { userId } = action.payload;
                if (state.currClass.teacher) {
                    state.currClass.teacher = state.currClass.teacher.filter(t => t._id !== userId);
                }
                if (state.currClass.student) {
                    state.currClass.student = state.currClass.student.filter(s => s._id !== userId);
                }
            }
        },
    }
});

export const { setJoinedClassTeacher, setJoinedClassStudent, setCreatedClass, setCurrClass, updateCurrClass, addClassMember, removeClassMember } = classSlice.actions;
export default classSlice.reducer;

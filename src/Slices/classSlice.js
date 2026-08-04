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
        removeClass(state, action) {
            const classId = action.payload?.classId || action.payload;
            if (!classId) return;
            const classIdStr = classId.toString();

            if (state.currClass && ((state.currClass._id && state.currClass._id.toString() === classIdStr) || state.currClass.id === classIdStr)) {
                state.currClass = null;
            }
            if (Array.isArray(state.createdClasses)) {
                state.createdClasses = state.createdClasses.filter(
                    c => (c._id ? c._id.toString() : c.toString()) !== classIdStr
                );
            }
            if (Array.isArray(state.joinedClassesAsTeacher)) {
                state.joinedClassesAsTeacher = state.joinedClassesAsTeacher.filter(
                    c => (c._id ? c._id.toString() : c.toString()) !== classIdStr
                );
            }
            if (Array.isArray(state.joinedClassesAsStudent)) {
                state.joinedClassesAsStudent = state.joinedClassesAsStudent.filter(
                    c => (c._id ? c._id.toString() : c.toString()) !== classIdStr
                );
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
        updateClassMember(state, action) {
            if (state.currClass) {
                const { user } = action.payload;
                if (state.currClass.admin && (state.currClass.admin._id === user._id || state.currClass.admin === user._id)) {
                    state.currClass.admin = { ...state.currClass.admin, ...user };
                }
                if (state.currClass.teacher) {
                    state.currClass.teacher = state.currClass.teacher.map(t =>
                        (t._id === user._id || t === user._id) ? { ...t, ...user } : t
                    );
                }
                if (state.currClass.student) {
                    state.currClass.student = state.currClass.student.map(s =>
                        (s._id === user._id || s === user._id) ? { ...s, ...user } : s
                    );
                }
            }
        },
        addCategory(state, action) {
            if (state.currClass) {
                const category = action.payload?.data || action.payload;
                if (!state.currClass.addedCategory) {
                    state.currClass.addedCategory = [];
                }
                const exists = state.currClass.addedCategory.some(c => (c._id || c) === (category._id || category));
                if (!exists) {
                    state.currClass.addedCategory.push(category);
                }
            }
        },
        removeCategory(state, action) {
            if (state.currClass && state.currClass.addedCategory) {
                const categoryId = action.payload?.categoryId || action.payload;
                state.currClass.addedCategory = state.currClass.addedCategory.filter(
                    c => (c._id || c) !== categoryId
                );
            }
        },
        updateCategory(state, action) {
            if (state.currClass && state.currClass.addedCategory) {
                const updatedCategory = action.payload?.data || action.payload;
                state.currClass.addedCategory = state.currClass.addedCategory.map(c =>
                    (c._id === updatedCategory._id || c === updatedCategory._id) ? { ...c, ...updatedCategory } : c
                );
            }
        },
    }
});

export const {
    setJoinedClassTeacher,
    setJoinedClassStudent,
    setCreatedClass,
    setCurrClass,
    updateCurrClass,
    removeClass,
    addClassMember,
    removeClassMember,
    updateClassMember,
    addCategory,
    removeCategory,
    updateCategory
} = classSlice.actions;
export default classSlice.reducer;

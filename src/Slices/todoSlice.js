import { createSlice } from "@reduxjs/toolkit";

const todoSlice = createSlice({
    name: 'todo',
    initialState: {
        todoData: [],
        selectedClassId: 'all',
        activeTab: 'Assigned', // 'Assigned' | 'Missing' | 'Done'
        groupBy: 'time',       // 'time' | 'circle'
        searchQuery: '',
        loading: false,
        isRefreshing: false,
        error: null,
    },
    reducers: {
        setTodoData(state, action) {
            state.todoData = action.payload;
        },
        setSelectedClassId(state, action) {
            state.selectedClassId = action.payload;
        },
        setActiveTab(state, action) {
            state.activeTab = action.payload;
        },
        setGroupBy(state, action) {
            state.groupBy = action.payload;
        },
        setSearchQuery(state, action) {
            state.searchQuery = action.payload;
        },
        setLoading(state, action) {
            state.loading = action.payload;
        },
        setIsRefreshing(state, action) {
            state.isRefreshing = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
        },
        resetTodoState(state) {
            state.todoData = [];
            state.selectedClassId = 'all';
            state.activeTab = 'Assigned';
            state.groupBy = 'time';
            state.searchQuery = '';
            state.loading = false;
            state.isRefreshing = false;
            state.error = null;
        }
    }
});

export const {
    setTodoData,
    setSelectedClassId,
    setActiveTab,
    setGroupBy,
    setSearchQuery,
    setLoading,
    setIsRefreshing,
    setError,
    resetTodoState
} = todoSlice.actions;

export default todoSlice.reducer;

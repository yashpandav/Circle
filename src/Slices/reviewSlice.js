import { createSlice } from "@reduxjs/toolkit";

const reviewSlice = createSlice({
    name: 'review',
    initialState: {
        reviewData: [],
        selectedClassId: 'all',
        activeTab: 'To Review', // 'To Review' | 'Reviewed'
        groupBy: 'time',        // 'time' | 'circle'
        searchQuery: '',
        loading: false,
        isRefreshing: false,
        error: null,
    },
    reducers: {
        setReviewData(state, action) {
            state.reviewData = Array.isArray(action.payload) ? action.payload : [];
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
        // Optimistic move from To Review -> Reviewed
        optimisticMarkReviewed(state, action) {
            const assId = action.payload?.toString();
            if (!assId) return;

            state.reviewData.forEach(classData => {
                const notReviewedList = classData.notReviedAss || [];
                const foundIndex = notReviewedList.findIndex(a => (a._id?.toString() || a?.toString()) === assId);
                if (foundIndex !== -1) {
                    const [item] = notReviewedList.splice(foundIndex, 1);
                    if (!classData.reviewdAss) classData.reviewdAss = [];
                    if (!classData.reviewdAss.some(a => (a._id?.toString() || a?.toString()) === assId)) {
                        classData.reviewdAss.push(item);
                    }
                }
            });
        },
        // Optimistic move from Reviewed -> To Review
        optimisticMarkPending(state, action) {
            const assId = action.payload?.toString();
            if (!assId) return;

            state.reviewData.forEach(classData => {
                const reviewedList = classData.reviewdAss || [];
                const foundIndex = reviewedList.findIndex(a => (a._id?.toString() || a?.toString()) === assId);
                if (foundIndex !== -1) {
                    const [item] = reviewedList.splice(foundIndex, 1);
                    if (!classData.notReviedAss) classData.notReviedAss = [];
                    if (!classData.notReviedAss.some(a => (a._id?.toString() || a?.toString()) === assId)) {
                        classData.notReviedAss.push(item);
                    }
                }
            });
        },
        resetReviewState(state) {
            state.reviewData = [];
            state.selectedClassId = 'all';
            state.activeTab = 'To Review';
            state.groupBy = 'time';
            state.searchQuery = '';
            state.loading = false;
            state.isRefreshing = false;
            state.error = null;
        }
    }
});

export const {
    setReviewData,
    setSelectedClassId,
    setActiveTab,
    setGroupBy,
    setSearchQuery,
    setLoading,
    setIsRefreshing,
    setError,
    optimisticMarkReviewed,
    optimisticMarkPending,
    resetReviewState
} = reviewSlice.actions;

export default reviewSlice.reducer;

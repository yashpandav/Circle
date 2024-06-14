import { createSlice } from "@reduxjs/toolkit";

const toggleSlice = createSlice({
    name: 'toggle',
    initialState: {
        toggle: false,
    },
    reducers: {
        setToggle(state, action) {
            state.toggle = action.payload;
        }
    }
});

export const { setToggle } = toggleSlice.actions;
export default toggleSlice.reducer;
import { createSlice } from "@reduxjs/toolkit"; 
import Cookies from 'js-cookie';

const getValidToken = () => {
    try {
        const token = Cookies.get('token');
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length !== 3) {
            Cookies.remove('token', { path: '/' });
            return null;
        }
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            Cookies.remove('token', { path: '/' });
            return null;
        }
        return token;
    } catch {
        Cookies.remove('token', { path: '/' });
        return null;
    }
};

const initialToken = getValidToken();

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: initialToken,
        login: !!initialToken,
    },
    reducers: {
        setUser(state, value){
            state.user = value.payload;
        },
        setLoggedIn(state, value){
            state.login = value.payload;
        },
        setToken(state, value){
            state.token = value.payload;
        },
        resetAuth(state) {
            state.user = null;
            state.token = null;
            state.login = false;
            Cookies.remove('token', { path: '/' });
        }
    }
});

export const { setUser, setLoggedIn, setToken, resetAuth } = authSlice.actions;
export default authSlice.reducer;
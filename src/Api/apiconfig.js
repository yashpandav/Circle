import axios from 'axios';
import Cookies from 'js-cookie';

export const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 <= Date.now()) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
};

export const axiosInstance = axios.create({});

// Response Interceptor to catch 401 Unauthorized globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            const url = error.config?.url || '';
            const isAuthEntryRoute = url.includes('/login') || url.includes('/signup') || url.includes('/genrateotp') || url.includes('/validate-otp');
            if (!isAuthEntryRoute) {
                Cookies.remove('token', { path: '/' });
                window.dispatchEvent(new Event('circle:session_expired'));
            }
        }
        return Promise.reject(error);
    }
);

export const apiConnector = (method, url, bodyData, header, params) => {
    let token = Cookies.get('token');
    if (token && !isTokenValid(token)) {
        Cookies.remove('token', { path: '/' });
        token = null;
        window.dispatchEvent(new Event('circle:session_expired'));
    }

    const headers = {
        ...header,
        Authorization: token ? `Bearer ${token}` : ''
    };

    return axiosInstance({
        method: method,
        url: url,
        data: bodyData || null,
        headers: headers,
        params: params || null,
    });
};
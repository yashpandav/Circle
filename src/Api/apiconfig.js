import axios from 'axios';
import Cookies from 'js-cookie';

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyData, header, params) => {
    const token = Cookies.get('token');
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
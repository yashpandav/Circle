import axios from 'axios';

export const axios = axios.create({});

export const apiConnector = (method , url , bodyData , header , params) => {
    return axios({
        method: method,
        url: url,
        data: bodyData ? bodyData : null,
        headers: header ? header : null,
        params: params ? params : null,
    })
}

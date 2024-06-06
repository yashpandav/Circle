// src/api/classApi.js
import axios from 'axios';
import { CLASS_API_URL } from './apis';

export const fetchAllClasses = async () => {
    try {
        const response = await axios.get("http://localhost:4000/class/allclass");
        console.log("RESPONSE", response);
        return response.data;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

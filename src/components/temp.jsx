// src/components/temp.jsx
import React, { useEffect, useState } from 'react';
import { fetchAllClasses } from '../Api/apiCaller/classapicaller';

const GetClass = () => {
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        const getClasses = async () => {
            try {
                const data = await fetchAllClasses();
                setClasses(data);
            } catch (error) {
                console.error("Error fetching classes", error);
            }
        };
        getClasses();
    }, []);

    return (
        <div>
            <h1>Classes</h1>
            <pre>{JSON.stringify(classes, null, 2)}</pre>
        </div>
    );
};

export default GetClass;

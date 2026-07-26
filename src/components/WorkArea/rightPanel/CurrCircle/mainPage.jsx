import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useParams } from "react-router-dom";
import CircleStaticNavbar from "../../../MainCircle/CircleStaticNavbar";
import { getClass } from "../../../../Api/apiCaller/classapicaller";
import './mainPage.css';

export default function MainCurrCircle() {
    const toggle = useSelector((state) => state.toggle.toggle);
    const currClass = useSelector((state) => state.classes.currClass);
    const { id } = useParams();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClass = async () => {
            if (!currClass || currClass._id !== id) {
                await dispatch(getClass({ id, dispatch })).unwrap().catch(err => {
                    console.error("Failed to fetch class on direct navigation", err);
                });
            }
            setLoading(false);
        };
        fetchClass();
    }, [id, currClass, dispatch]);

    if (loading || !currClass || currClass._id !== id) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' }}>Loading...</div>;
    }

    return (
        <div 
            className={`main-curr-circle ${!toggle ? 'main-curr-circle-toggle' : ''}`}
            style={{ '--class-theme': currClass?.classTheme || '#156f85' }}
        >
            <CircleStaticNavbar />
            <Outlet />
        </div>
    );
}

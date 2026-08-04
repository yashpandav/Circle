import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, useParams } from "react-router-dom";
import CircleStaticNavbar from "../../../MainCircle/CircleStaticNavbar";
import { getClass } from "../../../../Api/apiCaller/classapicaller";
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import './mainPage.css';

export default function MainCurrCircle() {
    const currClass = useSelector((state) => state.classes.currClass);
    const { id } = useParams();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchClass = async () => {
            if (!currClass || currClass._id !== id) {
                setLoading(true);
                try {
                    await dispatch(getClass({ id, dispatch })).unwrap();
                } catch (err) {
                    console.error("Failed to fetch class on direct navigation", err);
                }
            }
            if (isMounted) {
                setLoading(false);
            }
        };
        fetchClass();
        return () => {
            isMounted = false;
        };
    }, [id, currClass, dispatch]);

    if (loading || !currClass || currClass._id !== id) {
        return (
            <div className="main-curr-circle-loader-wrap">
                <LoaderComponent />
            </div>
        );
    }

    return (
        <div 
            className="main-curr-circle"
            style={{ '--class-theme': currClass?.classTheme || '#00a896' }}
        >
            <CircleStaticNavbar />
            <Outlet />
        </div>
    );
}


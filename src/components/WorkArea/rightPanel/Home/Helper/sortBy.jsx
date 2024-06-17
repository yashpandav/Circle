import React, { useState } from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import './sortBy.css';
import { useSelector } from "react-redux";

export default function SortBy({sortby , setSortBy}) {

    const {toggle} = useSelector((state) => state.toggle);

    const handleChange = (event) => {
        setSortBy(event.target.value);
    };

    return (
        <>
            <div className={`sort-main-container ${toggle ? "sort-toggled" : "sort-untoggle"}`}>
                <div id='sort-details'>
                    <h2>{sortby}</h2>
                </div>
                <div id="sortby-container">
                    <p>Sort By: </p>
                    <Select
                        id='select'
                        labelId="sortby-label"
                        value={sortby}
                        onChange={handleChange}
                        size="small"
                        variant="standard"
                    >
                        <MenuItem value='All'>All</MenuItem>
                        <MenuItem value='Admin'>Admin</MenuItem>
                        <MenuItem value='Teacher'>Teacher</MenuItem>
                        <MenuItem value='Student'>Student</MenuItem>
                    </Select>
                </div>
            </div>
            <div className={`divider ${toggle ? "divider-toggled" : "divider-untoggle"}`}></div>
        </>
    );
}

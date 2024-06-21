import React, { useState } from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useSelector } from "react-redux";
import './sortBy.css';

export default function SortBy({sortby , setSortBy}) {

    const handleChange = (event) => {
        setSortBy(event.target.value);
    };

    return (
        <>
            <div className='sort-main-container'>
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
            <div className='divider'></div>
        </>
    );
}

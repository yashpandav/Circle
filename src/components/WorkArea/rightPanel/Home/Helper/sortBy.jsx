import React, { useState } from "react";
import { MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import './sortBy.css';

export default function SortBy() {
    const [sortby, setSortBy] = useState('All');

    const handleChange = (event) => {
        setSortBy(event.target.value);
    };

    return (
        <div id="sortby-container">
            <h2>Sort By</h2>
                <Select
                    labelId="sortby-label"
                    value={sortby}
                    onChange={handleChange}
                >
                    <MenuItem value='All'>All</MenuItem>
                    <MenuItem value='Admin'>Admin</MenuItem>
                    <MenuItem value='Teacher'>Teacher</MenuItem>
                    <MenuItem value='Student'>Student</MenuItem>
                </Select>
        </div>
    );
}

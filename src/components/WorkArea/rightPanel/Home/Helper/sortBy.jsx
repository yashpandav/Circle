import React from "react";
import { MenuItem, Select} from "@mui/material";
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
                        value={sortby}
                        onChange={handleChange}
                        size="small"
                        variant="standard"
                        disableUnderline
                        sx={{
                            minWidth: 80,
                            backgroundColor: 'transparent',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            color: '#1e293b'
                        }}
                    >
                        <MenuItem value='All'>All</MenuItem>
                        <MenuItem value='Admin'>Admin</MenuItem>
                        <MenuItem value='Teacher'>Teacher</MenuItem>
                        <MenuItem value='Student'>Student</MenuItem>
                    </Select>
                </div>
            </div>
            <div className='sort-divider'></div>
        </>
    );
}

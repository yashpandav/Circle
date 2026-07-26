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
                        labelId="sortby-label"
                        value={sortby}
                        onChange={handleChange}
                        size="small"
                        variant="standard"
                        disableUnderline
                        sx={{
                            backgroundColor: '#f1f5f9',
                            borderRadius: '20px',
                            padding: '2px 12px',
                            fontWeight: 500,
                            color: '#1e293b',
                            fontSize: '0.95rem'
                        }}
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

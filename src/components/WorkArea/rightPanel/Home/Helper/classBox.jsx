import React from 'react';

export const Classes = ({item , index}) => {
    return(
        <div className='class' key={index}>
            <h3>{item.name}</h3>
        </div>
    )
}
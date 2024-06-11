import React from 'react';
import { Audio } from 'react-loader-spinner'
import './loader.css'

const LoaderComponent = () => (
    <div className="loader-container">
        <Audio
            height="80"
            width="80"
            radius="9"
            color="green"
            ariaLabel="three-dots-loading"
            wrapperStyle
            wrapperClass
        />
    </div>
);

export default LoaderComponent;

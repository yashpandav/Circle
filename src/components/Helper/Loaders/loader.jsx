import React from 'react';
import './loader.css';

const LoaderComponent = () => (
    <span className="loader"></span>
);

const CreatingLoader = () => {
    return (
        <><div className='backdrop'></div>
        <div className='creating-loader'>
            <img src={require('../../../Data/creatingAccountLoader.gif')} alt="creating-account-loader" />
            <span class="loading">Wait while creating account</span>
        </div></>
    );
};

export { LoaderComponent, CreatingLoader };
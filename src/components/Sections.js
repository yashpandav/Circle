import React from 'react';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const Home = lazy(() => import('./MainHomePage/Home/home'));
const About = lazy(() => import('./MainHomePage/About/about'));
const Explore = lazy(() => import('./MainHomePage/Explore/explore'));

const Sections = () => {
    return (
        <>
            <div id='home'>
                <ErrorBoundary fallback={<h1>Something Went Wrong</h1>}>
                    <Suspense fallback={<h1>Loading...</h1>}>
                        <Home />
                    </Suspense>
                </ErrorBoundary>
            </div>
            <div id='about'>
                <ErrorBoundary fallback={<h1>Something Went Wrong</h1>}>
                    <Suspense fallback={<h1>Loading...</h1>}>
                        <About />
                    </Suspense>
                </ErrorBoundary>
            </div>
            <div id='explore'>
                <ErrorBoundary fallback={<h1>Something Went Wrong</h1>}>
                    <Suspense fallback={<h1>Loading...</h1>}>
                        <Explore />
                    </Suspense>
                </ErrorBoundary>
            </div>
        </>
    );
};

export default Sections;
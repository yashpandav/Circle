import React from 'react';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const Navbar = lazy(() => import('./Navbar/Navbar'))
const Section = lazy(() => import('../Sections'))
const Footer = lazy(() => import('./Footer/footer'))

const MainHomePage = () => {
    return (
        <>
            <ErrorBoundary fallback={<h1>Something Went Wrong</h1>}>
                <Suspense fallback={<h1>Loading...</h1>}>
                    <Navbar></Navbar>
                    <Section></Section>
                    <Footer></Footer>
                </Suspense>
            </ErrorBoundary>
        </>
    );
};

export default MainHomePage;

import { Outlet } from 'react-router-dom';
import * as React from 'react';
import NavBar from './NavBar'
import Footer from './Footer'

export default function Layout() {
    return (
        <div className="text-white">
            <NavBar />
            <div className="bg-black pt-10">
                <Outlet /> {/* Nested routes render here */}
            </div>
            <Footer />
        </div>
    );
}

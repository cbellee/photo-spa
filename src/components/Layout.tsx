import { Outlet } from 'react-router-dom';
import * as React from 'react';
import NavBar from './NavBar'
import Footer from './Footer'

export default function Layout() {
    return (
        <div className="text-white">
            <NavBar />
            <main className="bg-black pt-10">
                <Outlet /> {/* Nested routes render here */}
            </main>
            <Footer />
        </div>
    );
}

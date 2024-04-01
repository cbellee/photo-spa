import { Outlet } from 'react-router-dom';
import * as React from 'react';
import NavBar from './NavBar'
import Footer from './Footer'
import Header from './Header'

export default function Layout() {
    return (
        <div className="text-white">
            <Header />
            <main className="bg-black pt-5">
                <Outlet /> {/* Nested routes render here */}
            </main>
            <Footer />
        </div>
    );
}

import { Outlet } from 'react-router-dom';
import * as React from 'react';
import Footer from './Footer.tsx'
import Header from './Header.tsx'

export default function Layout() {
    return (
        <div className="flex flex-col h-screen border-0 justify-between">
            <Header />
            <main className="mb-auto pb-12">
                <Outlet /> {/* Nested routes render here */}
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

/**
 * Layout — Root layout shell that wraps every route. Provides the
 * Header, a flex-grow main area (React Router Outlet), and the Footer.
 * Applies the global dark/light theme background.
 */
import { Outlet } from 'react-router-dom';
import * as React from 'react';
import Footer from './Footer.tsx'
import Header from './Header.tsx'
import { useTheme } from '../context/ThemeContext.tsx';

export default function Layout() {
    const { theme } = useTheme();

    return (
        <div className={`flex flex-col h-screen text-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-300' }`}>
            <Header />
            <main className={`mb-auto`}>
                <Outlet /> {/* Nested routes render here */}
            </main>
                <Footer />
        </div>
    );
}

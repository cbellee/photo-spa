import { Outlet } from 'react-router-dom';
import * as React from 'react';
import Footer from './Footer.tsx'
import Header from './Header.tsx'
import { useTheme } from '../context/ThemeContext.tsx';

export default function Layout() {
    const { theme } = useTheme();

    return (
        <div className={`flex flex-col h-screen border-0 justify-between ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-300'}`}>
            <Header />
            <main className={`mb-auto pb-12 ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-300'}`}>
                <Outlet /> {/* Nested routes render here */}
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

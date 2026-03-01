import React from 'react'
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
const { theme } = useTheme();
const currentYearUTC = new Date().getUTCFullYear();

    return (
        <div className={`align-middle text-center bottom-0 p-6 rounded-b-md ${theme === 'dark' ? 'text-white bg-gray-950' : 'bg-gray-100'}`}>
            <p className="text-center uppercase text-sm">&copy; Photo Album {currentYearUTC} </p>
        </div>
    );
}

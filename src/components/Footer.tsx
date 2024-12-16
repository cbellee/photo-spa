import React from 'react'
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
const { theme, toggleTheme } = useTheme();

    return (
        <div className={`align-middle text-center bottom-0 p-6 rounded-b-md ${theme === 'dark' ? 'text-white bg-gray-800' : 'bg-gray-100'}`}>
            <p className="text-centeruppercase text-sm">&copy; 2024 - Photo Album</p>
        </div>
    );
}

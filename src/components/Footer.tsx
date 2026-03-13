/**
 * Footer — Minimal footer. Now unused in the sidebar layout but kept
 * for backward compatibility.
 */
import React from 'react'
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
const { theme } = useTheme();
const currentYearUTC = new Date().getUTCFullYear();

    return (
        <div className={`text-center py-4 text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
            <p>&copy; {currentYearUTC} Photo Album</p>
        </div>
    );
}

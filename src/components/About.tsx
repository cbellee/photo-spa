import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function About() {
    const { theme } = useTheme();

    return (
        <div>
            <div className={`text-md text-center`}>
            </div>
            <div className={`text-center text-xl mt-7 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                <p>
                    This is a sample photo gallery application built using React with TypeScript, Tailwind CSS, and the Azure Blob Storage API.
                </p>
            </div>
        </div>
    )
}
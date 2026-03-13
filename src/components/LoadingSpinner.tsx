/**
 * LoadingSpinner — Themed loading indicator with accent color styling.
 */
import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface LoadingSpinnerProps {
    visible: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ visible }) => {
    const { theme } = useTheme();

    if (!visible) return null;

    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="h-12 w-12 animate-spin rounded-full border-4 border-accent/30 border-t-accent" />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading...
            </span>
        </div>
    );
};

export default LoadingSpinner;

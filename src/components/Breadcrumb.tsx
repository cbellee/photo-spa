/**
 * Breadcrumb — Renders a breadcrumb navigation trail with the new
 * dashboard styling. Uses accent color for links and subtle separators.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export interface BreadcrumbSegment {
    label: string;
    to?: string;
}

interface BreadcrumbProps {
    segments: BreadcrumbSegment[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ segments }) => {
    const { theme } = useTheme();

    return (
        <div className="flex items-center gap-2 pb-6 text-sm">
            {segments.map((segment, idx) => (
                <span key={idx} className="flex items-center gap-2">
                    {idx > 0 && (
                        <span className={`${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>/</span>
                    )}
                    {segment.to ? (
                        <Link
                            to={segment.to}
                            className={`font-medium transition-colors ${
                                theme === 'dark'
                                    ? 'text-gray-400 hover:text-accent-light'
                                    : 'text-gray-500 hover:text-accent'
                            }`}
                        >
                            {segment.label}
                        </Link>
                    ) : (
                        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {segment.label}
                        </span>
                    )}
                </span>
            ))}
        </div>
    );
};

export default Breadcrumb;

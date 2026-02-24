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
    const linkColor = theme === 'dark' ? 'text-blue-500' : 'text-blue-700';

    return (
        <div className="text-left pt-4 pb-4 text-md">
            {segments.map((segment, idx) => (
                <span key={idx}>
                    {idx > 0 && (
                        <span className={`${linkColor} uppercase`}> &gt; </span>
                    )}
                    {segment.to ? (
                        <Link to={segment.to} className={`${linkColor} uppercase underline`}>
                            {segment.label}
                        </Link>
                    ) : (
                        <span className={`${linkColor} uppercase`}>{segment.label}</span>
                    )}
                </span>
            ))}
        </div>
    );
};

export default Breadcrumb;

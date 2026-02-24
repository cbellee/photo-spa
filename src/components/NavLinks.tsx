import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface NavLinksProps {
    isAuthenticated: boolean;
}

export interface NavItem {
    to: string;
    label: string;
    authRequired?: boolean;
}

const navItems: NavItem[] = [
    { to: '/upload', label: 'Upload', authRequired: true },
    { to: '/', label: 'Collections' },
    { to: '/About', label: 'About' },
];

const NavLinks: React.FC<NavLinksProps> = ({ isAuthenticated }) => {
    const { theme } = useTheme();

    const activeClass = theme === 'dark'
        ? 'hover:text-orange-200 text-orange-300'
        : 'hover:text-orange-300 text-orange-500';
    const inactiveClass = theme === 'dark'
        ? 'hover:text-white text-gray-300'
        : 'hover:text-gray-800 text-gray-500';
    const separatorClass = theme === 'dark' ? 'text-gray-600' : 'text-gray-400';

    const visibleItems = navItems.filter(
        (item) => !item.authRequired || isAuthenticated,
    );

    return (
        <ul className="DESKTOP-MENU hidden space-x-8 lg:flex pr-6 uppercase">
            {visibleItems.map((item, idx) => (
                <Fragment key={item.to}>
                    {idx > 0 && (
                        <span className={`align-top flex ${separatorClass}`}>I</span>
                    )}
                    <li>
                        <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                                isActive ? `${activeClass} active` : inactiveClass
                            }
                        >
                            {item.label}
                        </NavLink>
                    </li>
                </Fragment>
            ))}
            <li></li>
        </ul>
    );
};

export default NavLinks;

/**
 * NavLinks — Desktop horizontal navigation bar rendered inside Header.
 * Filters nav items by authentication state (e.g. Upload is auth-only)
 * and highlights the active route with an orange accent.
 * Collections stays highlighted on descendant /:collection and
 * /:collection/:album routes.
 */
import React, { Fragment } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface NavLinksProps {
    isAuthenticated: boolean;
}

export interface NavItem {
    to: string;
    label: string;
    authRequired?: boolean;
}

/** Named top-level routes that are NOT part of the collections hierarchy */
const nonCollectionPrefixes = ['/upload'];

const navItems: NavItem[] = [
    { to: '/upload', label: 'upload', authRequired: true },
    { to: '/', label: 'collections' },
];

const NavLinks: React.FC<NavLinksProps> = ({ isAuthenticated }) => {
    const { theme } = useTheme();
    const location = useLocation();

    /** True when the current path is /, /:collection, or /:collection/:album */
    const isCollectionsRoute = !nonCollectionPrefixes.some((p) =>
        location.pathname.toLowerCase().startsWith(p),
    );

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
        <ul className="DESKTOP-MENU hidden space-x-8 md:flex pr-6 uppercase">
            {visibleItems.map((item, idx) => (
                <Fragment key={item.to}>
                    {idx > 0 && (
                        <span className={`align-top flex ${separatorClass}`}>I</span>
                    )}
                    <li>
                        <NavLink
                            to={item.to}
                            className={({ isActive }) => {
                                const active =
                                    item.to === '/'
                                        ? isCollectionsRoute
                                        : isActive;
                                return active ? `${activeClass} active` : inactiveClass;
                            }}
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

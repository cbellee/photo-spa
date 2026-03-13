/**
 * Sidebar — Left navigation panel styled after the Social Photo Gallery
 * Dashboard design. Contains the app logo, navigation links with icons,
 * user info, sign-in/out, and theme toggle.
 */
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { IoMoon, IoSunny, IoImages, IoCloudUpload, IoMenu, IoClose } from 'react-icons/io5';
import { useIsAuthenticated, useMsal, useAccount } from '@azure/msal-react';
import { useTheme } from '../context/ThemeContext';
import SignInAndOut from './SignInAndOut';

/** Named top-level routes that are NOT part of the collections hierarchy */
const nonCollectionPrefixes = ['/upload'];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { instance } = useMsal();
    const account = useAccount(instance.getActiveAccount() ?? undefined);
    const isAuthenticated = useIsAuthenticated();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const isCollectionsRoute = !nonCollectionPrefixes.some((p) =>
        location.pathname.toLowerCase().startsWith(p),
    );

    const navItems = [
        { to: '/', label: 'Collections', icon: IoImages, isActive: isCollectionsRoute },
        ...(isAuthenticated ? [{ to: '/upload', label: 'Upload', icon: IoCloudUpload, isActive: false }] : []),
    ];

    const sidebarContent = (
        <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-sidebar text-gray-300' : 'bg-white text-gray-700 border-r border-surface-light-border'}`}>
            {/* Logo area */}
            <div className={`flex items-center gap-3 px-5 py-6 ${collapsed ? 'justify-center' : ''}`}>
                <a href="/" className="flex items-center gap-3 no-underline">
                    <img src="/app-icon.png" className="w-10 h-10 flex-shrink-0 rounded-md" alt="logo" />
                    {!collapsed && (
                        <span className={`text-lg font-semibold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Photos
                        </span>
                    )}
                </a>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 mt-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={() => {
                            const active = item.to === '/' ? isCollectionsRoute : location.pathname === item.to;
                            return `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                                active
                                    ? theme === 'dark'
                                        ? 'bg-accent/15 text-accent-light shadow-glow'
                                        : 'bg-accent/10 text-accent-dark'
                                    : theme === 'dark'
                                        ? 'text-gray-400 hover:text-white hover:bg-sidebar-hover'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            } ${collapsed ? 'justify-center' : ''}`;
                        }}
                    >
                        <item.icon size={20} />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom section — user & controls */}
            <div className={`mt-auto px-3 pb-5 space-y-3 ${theme === 'dark' ? 'border-t border-sidebar-hover' : 'border-t border-gray-100'} pt-4`}>
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                        theme === 'dark'
                            ? 'text-gray-400 hover:text-white hover:bg-sidebar-hover'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    } ${collapsed ? 'justify-center' : ''}`}
                >
                    {theme === 'dark' ? <IoSunny size={20} /> : <IoMoon size={20} />}
                    {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                {/* User info */}
                {isAuthenticated && account && !collapsed && (
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-sidebar-hover' : 'bg-gray-50'}`}>
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {account.name?.charAt(0) ?? '?'}
                        </div>
                        <div className="min-w-0">
                            <p className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {account.name?.split(' ')[0]}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                                {account.username}
                            </p>
                        </div>
                    </div>
                )}

                {/* Sign in/out */}
                <SignInAndOut collapsed={collapsed} />
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger trigger */}
            <button
                className={`fixed top-4 left-4 z-50 md:hidden p-2 rounded-md ${theme === 'dark' ? 'bg-sidebar-light text-white' : 'bg-white text-gray-700 shadow-md'}`}
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile slide-out */}
            <aside className={`fixed top-0 left-0 z-40 h-full w-64 transform transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className={`hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
                {sidebarContent}
                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`absolute -right-3 top-8 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                        theme === 'dark'
                            ? 'bg-sidebar-active text-gray-300 hover:bg-accent border border-sidebar-hover'
                            : 'bg-white text-gray-400 hover:bg-accent hover:text-white border border-gray-200 shadow-sm'
                    }`}
                >
                    {collapsed ? '›' : '‹'}
                </button>
            </aside>
        </>
    );
}

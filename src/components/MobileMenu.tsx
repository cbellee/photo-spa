/**
 * MobileMenu — Full-screen overlay navigation menu for small viewports.
 * Now mostly handled by the Sidebar component, but kept for backward
 * compatibility.
 */
import React from 'react';
import SignInAndOut from './SignInAndOut';
import { useTheme } from '../context/ThemeContext';

interface MobileMenuProps {
    isOpen: boolean;
    isAuthenticated: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, isAuthenticated, onClose }) => {
    const { theme } = useTheme();

    return (
        <div className={isOpen ? 'showMenuNav' : 'hideMenuNav'}>
            <div
                className="absolute top-0 right-0 px-8 py-8"
                onClick={onClose}
            >
                <svg
                    className="h-8 w-8 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </div>
            <ul className="flex flex-col items-center justify-between min-h-[250px]">
                {isAuthenticated && (
                    <li className="text-sm font-medium">
                        <a href="/upload" className={`${theme === 'dark' ? 'text-gray-300 hover:text-accent-light' : 'text-gray-600 hover:text-accent'}`}>upload</a>
                    </li>
                )}
                <li className="text-sm font-medium">
                    <a href="/" className={`${theme === 'dark' ? 'text-gray-300 hover:text-accent-light' : 'text-gray-600 hover:text-accent'}`}>collections</a>
                </li>
                <li>
                    <SignInAndOut />
                </li>
            </ul>
            <style>{`
                .hideMenuNav {
                    display: none;
                }
                .showMenuNav {
                    display: block;
                    position: absolute;
                    width: 100%;
                    height: 100vh;
                    top: 0;
                    left: 0;
                    background: ${theme === 'dark' ? '#0f0e17' : 'white'};
                    color: ${theme === 'dark' ? 'white' : '#374151'};
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;
                    align-items: center;
                }
            `}</style>
        </div>
    );
};

export default MobileMenu;

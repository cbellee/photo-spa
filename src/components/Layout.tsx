/**
 * Layout — Root layout shell using a sidebar + main content pattern.
 * The sidebar provides navigation, and the main area fills the
 * remaining viewport with a scrollable content region.
 */
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext.tsx';

export default function Layout() {
    const { theme } = useTheme();

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className={`flex flex-col flex-1 min-w-0 overflow-y-auto ${theme === 'dark' ? 'bg-surface' : 'bg-surface-light'}`}>
                <main className="flex-1 px-4 md:px-8 py-6 pt-14 md:pt-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

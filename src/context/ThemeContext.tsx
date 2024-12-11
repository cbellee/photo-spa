import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);
const initialState = localStorage.getItem('theme') as Theme || 'dark';

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(initialState);

    function toggleTheme() {
        setTheme((prevTheme) => {
            if (prevTheme === 'light') {
                localStorage.setItem('theme', 'dark');
                return 'dark';
            } else {
                localStorage.setItem('theme', 'light');
                return 'light';
            }
        });
    };

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
    </ThemeContext.Provider>
}

function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export { ThemeProvider, useTheme };
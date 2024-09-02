import React, { createContext, useState } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState("dark-theme");

    function toggleTheme() {
        if (theme === "dark-theme") {
            setTheme("light-theme");
        } else {
            setTheme("dark-theme");
        }
    }

    return (
        <ThemeContext.Provider
        value={{
            theme,
            setTheme,
            toggleTheme
        }}
        >
            {children}
        </ThemeContext.Provider>
    )
};
export {ThemeContext, ThemeProvider}
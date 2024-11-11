import React, {useEffect, useState, createContext, FC, PropsWithChildren, useContext} from "react";
import {getLocalStorageItem, setLocalStorageItem} from "../services/LocalStorageHelper";

const DarkModeContext = createContext({
    isDarkMode: false,
    toggleDarkMode: (): void => undefined
})

export const DarkModeProvider: FC<PropsWithChildren> = ({children}) => {
    const [isDarkMode, setIsDarkMode] = useState(getLocalStorageItem('darkMode') ?? false);

    useEffect(() => {
        if (getLocalStorageItem('darkMode') === null) {
            const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDarkMode);
        }
    }, [])

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(current => {
            setLocalStorageItem('darkMode', !current);
            return !current
        });
    }

    return <DarkModeContext.Provider value={{isDarkMode, toggleDarkMode}}>
        {children}
    </DarkModeContext.Provider>
}

export const useDarkMode = (): { toggleDarkMode: () => void, isDarkMode: boolean } => {
    const {isDarkMode, toggleDarkMode} = useContext(DarkModeContext)

    return {isDarkMode, toggleDarkMode}
}
import React, {useMemo} from 'react';
import {createTheme, responsiveFontSizes, Theme} from '@mui/material/styles';
import {indigo, orange, yellow} from '@mui/material/colors';
import {useClientConfig} from '../config/useClientConfig';

interface ContextState {
    theme: Theme,
}

export const ThemeContext = React.createContext<ContextState>({} as ContextState);

export const ThemeContextProvider = (props: { children: React.ReactNode }): JSX.Element => {
    const [darkMode] = useClientConfig('theme.darkMode');

    const theme = useMemo(() => {
        return responsiveFontSizes(createTheme({
            palette: {
                mode: darkMode ? 'dark' : 'light',
                primary: {
                    main: darkMode ? '#C650C6' : orange[800],
                },
                secondary: {
                    main: darkMode ? '#e1e122' : indigo[700],
                },
                warning: {
                    main: yellow[500],
                },
            },

        }));
    }, [darkMode]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
            }}
        >
            {props.children}
        </ThemeContext.Provider>
    );

};

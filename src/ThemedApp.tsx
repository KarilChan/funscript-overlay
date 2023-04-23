import React, {FC, Suspense, useContext} from 'react';
import {CssBaseline, StyledEngineProvider} from '@mui/material';
import {ThemeProvider} from '@mui/material/styles';
import {SnackbarProvider} from 'notistack';
import styled from '@emotion/styled';
import DoneIcon from '@mui/icons-material/Done';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import {SnackbarUtilsConfigurator} from './services/notistack/SnackbarUtilsConfigurator';
import {ThemeContext} from './theme/ThemeContextProvider';
import {Converter} from './Converter';
import {ConverterContextProvider} from './ConverterContext';

export const ThemedApp: FC = () => {
    const {theme} = useContext(ThemeContext);

    return (
        <StyledEngineProvider injectFirst>
            <ConverterContextProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <Suspense fallback={<>Loading...</>}>
                        <SnackbarProvider
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            iconVariant={{
                                success: <DoneIcon fontSize={'large'}/>,
                                error: null,
                                warning: <WarningIcon fontSize={'large'}/>,
                                info: <InfoIcon fontSize={'large'}/>,
                            }}
                            style={{
                                zIndex: 9000, // snackbars should always be at the top
                            }}
                        >
                            <SnackbarUtilsConfigurator/>
                            <Converter/>
                        </SnackbarProvider>
                    </Suspense>
                </ThemeProvider>
            </ConverterContextProvider>
        </StyledEngineProvider>
    );
};

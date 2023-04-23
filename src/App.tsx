import React from 'react';
import {ThemedApp} from './ThemedApp';
import {ThemeContextProvider} from './theme/ThemeContextProvider';

const App = (): JSX.Element => {
    return (
        <ThemeContextProvider>
            <ThemedApp/>
        </ThemeContextProvider>
    );
};

export default App;

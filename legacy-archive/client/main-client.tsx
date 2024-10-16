import './global.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import { AppContext, appErrorContext } from '../shared/appContext';

const parseAppContext = (): AppContext => {
    try {
        const contextElement = document.getElementById('app-context');
        return contextElement ? JSON.parse(contextElement.innerText) : appErrorContext;
    } catch (e) {
        console.error(`Failed to parse app context - ${e}`);
        return appErrorContext;
    }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App appContext={parseAppContext()} />
    </React.StrictMode>
);

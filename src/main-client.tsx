import './global.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App.tsx';
import { AppContext, appErrorContext } from '../common/appContext.ts';

const parseAppContext = (): AppContext => {
    try {
        const contextElement = document.getElementById('app-context');
        return contextElement
            ? JSON.parse(contextElement.innerText)
            : appErrorContext;
    } catch (e) {
        console.error(`Failed to parse app context - ${e}`);
        return appErrorContext;
    }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App context={parseAppContext()} />
    </React.StrictMode>
);

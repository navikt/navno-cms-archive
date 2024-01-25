import './global.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import { AppContext } from '../common/types/appContext.ts';

const parseAppContext = (): AppContext => {
    try {
        const contextElement = document.getElementById('app-context');
        return contextElement ? JSON.parse(contextElement.innerText) : {};
    } catch (e) {
        console.error(`Failed to parse app context - ${e}`);
        return { rootCategories: [], cmsName: "Failed to parse context!" };
    }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App context={parseAppContext()} />
    </React.StrictMode>,
);

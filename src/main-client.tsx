import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'

const parseAppContext = () => {
    try {
        const contextElement = document.getElementById('app-context');
        return contextElement ? JSON.parse(contextElement.innerText) : {};
    } catch (e) {
        console.error(`Failed to parse app context - ${e}`);
        return {};
    }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App context={parseAppContext()} />
    </React.StrictMode>,
)

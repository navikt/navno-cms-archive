import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import { appErrorContext } from '../shared/appContext';
import { parseAppContext } from '@common/client/parseAppContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App appContext={parseAppContext(appErrorContext)} />
    </React.StrictMode>
);

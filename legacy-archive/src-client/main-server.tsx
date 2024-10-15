import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './components/App';
import { AppContext } from '../src-common/appContext';

export const render = (url: string, context: AppContext) => {
    return renderToString(<App appContext={context} />);
};

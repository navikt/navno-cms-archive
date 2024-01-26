import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './components/App.tsx';
import { AppContext } from '../common/appContext.ts';

export const render = (url: string, context: AppContext) => {
    return renderToString(<App context={context} />);
};

import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.tsx';
import { AppContext } from '../common/types/appContext.ts';

export const render = (url: string, context: AppContext) => {
    return renderToString(
        <App context={context} />,
    );
};

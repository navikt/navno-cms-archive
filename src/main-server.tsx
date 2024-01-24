import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.tsx';

export const render = (url: string, context: any) => {
    return renderToString(
        <App context={context} />,
    );
};

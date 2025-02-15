import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';

export const render = (url: string, context: unknown) => {
    return renderToString(<App />);
};

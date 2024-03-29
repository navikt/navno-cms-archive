import express, { Express } from 'express';
import path from 'path';
import { createServer } from 'vite';
import { devRender, HtmlRenderer, prodRender } from './htmlRenderer';

const assetsDir = path.resolve(process.cwd(), 'dist', 'client');

export const initAndGetRenderer = async (expressApp: Express): Promise<HtmlRenderer> => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Configuring site renderer for development mode');

        const vite = await createServer({
            server: { middlewareMode: true },
            appType: 'custom',
            root: '../',
            base: process.env.APP_BASEPATH,
        });

        expressApp.use(vite.middlewares);

        return devRender(vite);
    }

    console.log(`Configuring site renderer for production mode - Using assets dir ${assetsDir}`);

    expressApp.use(
        '/',
        express.static(assetsDir, {
            maxAge: '1y',
            index: 'false',
        })
    );

    return prodRender;
};

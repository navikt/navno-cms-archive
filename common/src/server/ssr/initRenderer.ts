import express, { Router } from 'express';
import path from 'path';
import { createServer } from 'vite';
import { AppHtmlRenderer, devRenderer, HtmlRenderer, prodRenderer } from './htmlRenderer';

const assetsDir = path.resolve(process.cwd(), 'dist', 'client');

type Props = {
    router: Router;
    appHtmlRenderer: AppHtmlRenderer;
    ssrModulePath: string;
    appBaseBath: string;
};

export const buildHtmlRenderer = async ({
    router,
    appHtmlRenderer,
    ssrModulePath,
    appBaseBath,
}: Props): Promise<HtmlRenderer> => {
    if (process.env.NODE_ENV === 'development') {
        console.log('Configuring site renderer for development mode');

        const vite = await createServer({
            server: { middlewareMode: true },
            appType: 'custom',
            root: '../',
            base: appBaseBath,
        });

        router.use(vite.middlewares);

        return devRenderer(vite, ssrModulePath);
    }

    console.log(`Configuring site renderer for production mode - Using assets dir ${assetsDir}`);

    router.use(
        '/',
        express.static(assetsDir, {
            maxAge: '1y',
            index: 'false',
        })
    );

    return prodRenderer(appHtmlRenderer);
};

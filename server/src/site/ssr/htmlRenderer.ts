import { buildHtmlTemplate } from './templateBuilder';
import { ViteDevServer } from 'vite';
import { render } from '../../_ssr-dist/main-server';

export type HtmlRenderer = (url: string) => Promise<string>;

const processTemplate = async (
    templateHtml: string,
    appHtml: string,
    url: string,
) => {
    return templateHtml
        .replace('<!--ssr-app-html-->', appHtml);
};

export const prodRender: HtmlRenderer = async (url) => {
    const template = buildHtmlTemplate();

    try {
        const appHtml = render(url);
        return processTemplate(template, appHtml, url);
    } catch (e) {
        console.error(`Rendering failed ${e}}`);
        return processTemplate(template, '', url);
    }
};

const devErrorHtml = (e: Error) => {
    return `
        <div style='max-width: 1344px;width: 100%;margin: 1rem auto'>
            <span>Server rendering error: ${e}</span>
            <div style='font-size: 0.75rem; margin-top: 1rem'>
                <code>${e.stack}</code>
            </div>
        </div>`;
};

export const devRender =
    (vite: ViteDevServer): HtmlRenderer =>
        async (url) => {
            const template = buildHtmlTemplate();
            const html = await vite.transformIndexHtml(url, template);

            try {
                const { render } = await vite.ssrLoadModule('/src/main-server.tsx');
                const appHtml = render(url);
                return processTemplate(html, appHtml, url);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    vite.ssrFixStacktrace(e);
                    console.error(`Dev render error: ${e} \n ${e.stack}`);
                    return processTemplate(html, devErrorHtml(e), url);
                } else {
                    const msg = `Unknown error: ${e}`;
                    console.error(msg);
                    return msg;
                }
            }
        };

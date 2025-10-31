import { ViteDevServer } from 'vite';
import { buildHtmlTemplate } from './templateBuilder';
import { getErrorMessage } from '../../shared/fetchUtils';

type AppContext = Record<string, unknown>;

export type AppHtmlRenderer = (url: string, context: AppContext) => string;
export type HtmlRenderer = (url: string, context: AppContext) => Promise<string>;

const processTemplate = (templateHtml: string, appHtml: string, appContext: AppContext) => {
    return templateHtml
        .replace('<!--ssr-app-html-->', appHtml)
        .replace('"ssr-app-context"', JSON.stringify(appContext));
};

export const prodRenderer =
    (render: AppHtmlRenderer): HtmlRenderer =>
    (url, context) => {
        const template = buildHtmlTemplate();

        try {
            const appHtml = render(url, context);
            return Promise.resolve(processTemplate(template, appHtml, context));
        } catch (e) {
            console.error(`Rendering failed ${getErrorMessage(e)}`);
            return Promise.resolve(processTemplate(template, '', context));
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

export const devRenderer =
    (vite: ViteDevServer, ssrEntryModule: string): HtmlRenderer =>
    async (url, context) => {
        const template = buildHtmlTemplate();
        const html = await vite.transformIndexHtml(url, template);

        try {
            const module = (await vite.ssrLoadModule(ssrEntryModule)) as {
                render: AppHtmlRenderer;
            };
            const appHtml: string = module.render(url, context);

            return processTemplate(html, appHtml, context);
        } catch (e: unknown) {
            if (e instanceof Error) {
                vite.ssrFixStacktrace(e);
                console.error(`Dev render error: ${e} \n ${e.stack}`);
                return processTemplate(html, devErrorHtml(e), context);
            } else {
                const msg = `Unknown error: ${getErrorMessage(e)}`;
                console.error(msg);
                return msg;
            }
        }
    };

import { RequestHandler } from 'express';
import { Browser } from 'puppeteer';
import { ContentService } from './ContentService';
import {
    XpArchiveOpenSearchClient,
    XP_ARCHIVE_INDEX,
} from '../opensearch/XpArchiveOpenSearchClient';
import { XpArchiveDocument } from '../opensearch/types';
import { validateQuery } from '../utils/params';

export class IndexingService {
    private readonly contentService: ContentService;
    private readonly openSearchClient: XpArchiveOpenSearchClient;
    private readonly browser: Browser;

    constructor(
        contentService: ContentService,
        openSearchClient: XpArchiveOpenSearchClient,
        browser: Browser
    ) {
        this.contentService = contentService;
        this.openSearchClient = openSearchClient;
        this.browser = browser;
    }

    private async createStaticSnapshot(html: string): Promise<string> {
        const renderOrigin = new URL(process.env.HTML_RENDER_API ?? '').origin;

        // Next.js prod mode puts all CSS in /_next/static/css/ — extract from raw HTML (may be absolute or relative)
        const cssUrls = [
            ...new Set(
                [...html.matchAll(/href=["']([^"']*\/_next\/static\/css\/[^"']+)["']/gi)].map(
                    (m) => (m[1].startsWith('http') ? m[1] : `${renderOrigin}${m[1]}`)
                )
            ),
        ];

        const cssTexts = await Promise.all(
            cssUrls.map(async (url) => {
                try {
                    const r = await fetch(url);
                    return r.ok ? r.text() : '';
                } catch {
                    return '';
                }
            })
        );

        const inlinedCss = cssTexts.filter(Boolean).join('\n');

        const page = await this.browser.newPage();
        try {
            //TODO: domcontentloaded eller load eller noe annet?
            await page.setContent(html, { waitUntil: 'domcontentloaded' });

            await page.evaluate((css) => {
                document
                    .querySelectorAll('script, link, style[data-next-hide-fouc]')
                    .forEach((el) => el.remove());

                document
                    .querySelectorAll<HTMLImageElement>('img[src*="/_next/image"]')
                    .forEach((img) => {
                        const original = new URL(img.src).searchParams.get('url');
                        if (original) img.src = original;
                    });

                const style = document.createElement('style');
                style.textContent = css;
                document.head.appendChild(style);
            }, inlinedCss);

            return page.content();
        } finally {
            await page.close();
        }
    }

    private async indexContentVersion(
        nodeId: string,
        locale: string,
        versionId: string
    ): Promise<boolean> {
        const content = await this.contentService.fetchContent(
            nodeId,
            locale,
            versionId,
            true,
            true
        );

        if (!content) {
            return false;
        }

        const { json, versions } = content;
        const version = versions.find((v) => v.versionId === versionId);

        if (!version) {
            console.error(`Version ${versionId} not found in versions list for ${nodeId}`);
            return false;
        }

        let html: string | undefined;
        if (content.html) {
            try {
                html = await this.createStaticSnapshot(content.html);
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                console.error(`Snapshot failed for ${nodeId}:${versionId}: ${msg}`);
            }
        }

        if (!html) {
            console.warn(`Indexed without HTML: ${nodeId}:${versionId}`);
        }

        const doc: XpArchiveDocument = {
            nodeId,
            versionId,
            path: json._path,
            displayName: json.displayName,
            type: json.type,
            locale,
            timestamp: version.timestamp,
            modifiedTime: json.modifiedTime,
            searchText: '',
            html,
            json,
        };

        return this.openSearchClient.indexDocument(XP_ARCHIVE_INDEX, `${nodeId}:${versionId}`, doc);
    }

    public async indexAllVersions(nodeId: string, locale: string): Promise<boolean> {
        const versions = await this.contentService.fetchVersions(nodeId, locale);

        if (!versions) {
            return false;
        }

        const BATCH_SIZE = 4;
        let allOk = true;

        for (let i = 0; i < versions.length; i += BATCH_SIZE) {
            const batch = versions.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(
                batch.map((v) => this.indexContentVersion(nodeId, locale, v.versionId))
            );
            allOk = allOk && results.every(Boolean);
        }

        return allOk;
    }

    public indexContentHandler: RequestHandler = (req, res) => {
        if (req.headers['secret'] !== process.env.SERVICE_SECRET) {
            res.status(401).send('Unauthorized');
            return;
        }

        if (!validateQuery(req.query, ['id', 'locale'], ['versionId'])) {
            res.status(400).send('Missing or invalid parameters');
            return;
        }

        const { id, locale, versionId } = req.query;

        res.status(202).json({ accepted: true });

        const indexPromise = versionId
            ? this.indexContentVersion(id, locale, versionId)
            : this.indexAllVersions(id, locale);

        indexPromise
            .then((success) => {
                if (!success) {
                    console.error(`Indexing failed for ${id}:${versionId ?? 'all'}`);
                }
            })
            .catch((e) => console.error(`Indexing error for ${id}: ${e}`));
    };
}

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
            // Snapshot trenger ingen eksterne ressurser: CSS inlines manuelt, scripts
            // fjernes, og <img>-URLer beholdes som referanser. Ved å aborte alt unntatt
            // selve dokumentet fyrer DOMContentLoaded rett etter parsing i stedet for å
            // henge på scripts/fonter — som ga sporadiske 30s Navigation timeouts.
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.resourceType() === 'document') {
                    request.continue().catch(() => {});
                } else {
                    request.abort().catch(() => {});
                }
            });

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
        await this.openSearchClient.ensureIndex(XP_ARCHIVE_INDEX);

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

        const BATCH_SIZE = 24;
        const failedVersionIds: string[] = [];
        const startTime = Date.now();

        console.log(
            `Indexing ${versions.length} versions for ${nodeId} (batch size ${BATCH_SIZE})`
        );

        for (let i = 0; i < versions.length; i += BATCH_SIZE) {
            const batch = versions.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(
                batch.map((v) => this.indexContentVersion(nodeId, locale, v.versionId))
            );
            results.forEach((ok, idx) => {
                if (!ok) {
                    failedVersionIds.push(batch[idx].versionId);
                }
            });

            const done = Math.min(i + BATCH_SIZE, versions.length);
            const pct = Math.round((done / versions.length) * 100);
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            console.log(`  ${done}/${versions.length} (${pct}%) for ${nodeId} – ${elapsed}s`);
        }

        // Enkeltversjoner kan være korrupte/uleselige i XP (f.eks. «Invalid property
        // for content»). Én slik versjon skal ikke velte hele reindekseringen – logg
        // hvilke som ble hoppet over, og regn jobben som vellykket så lenge ikke alt feilet.
        if (failedVersionIds.length > 0) {
            console.warn(
                `Skipped ${failedVersionIds.length}/${versions.length} versions for ${nodeId} ` +
                    `that could not be fetched/indexed (likely corrupt or unavailable upstream): ` +
                    failedVersionIds.join(', ')
            );
        }

        const totalElapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(
            `Done indexing ${nodeId}: ${versions.length - failedVersionIds.length}/${versions.length} in ${totalElapsed}s`
        );

        const allFailed = versions.length > 0 && failedVersionIds.length === versions.length;
        return !allFailed;
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

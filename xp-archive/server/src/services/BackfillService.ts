import { fetchJson } from '@common/shared/fetchUtils';
import { xpServiceUrl } from '../utils/urls';
import { IndexingService } from './IndexingService';
import { XpArchiveOpenSearchClient } from '../opensearch/XpArchiveOpenSearchClient';

// Speiler kontrakten fra enonic-xp externalArchive/nodeList.
type NodeListEntry = {
    id: string;
    locale: string;
    path: string;
};

type NodeListResult = {
    nodes: NodeListEntry[];
    count: number;
    nextAfter: string;
    hasMore: boolean;
};

const PAGE_SIZE = 1000;

// Backfill: enumererer publisert innhold via enonic-xp sitt nodeList-endepunkt og
// indekserer alle versjoner per node. Kjøres kun fra naisjob-en (backfillJob.ts).
//
// Pacing: indexAllVersions kjøres SEKVENSIELT (await per node), så vi aldri får N
// samtidige Puppeteer-renders. Cursor-paginering (after/nextAfter) konsumeres slik
// nodeList-kontrakten foreskriver: loop til hasMore er false.
export class BackfillService {
    private readonly indexingService: IndexingService;
    private readonly openSearchClient?: XpArchiveOpenSearchClient;

    constructor(indexingService: IndexingService, openSearchClient?: XpArchiveOpenSearchClient) {
        this.indexingService = indexingService;
        this.openSearchClient = openSearchClient;
    }

    private async fetchLocales(): Promise<string[]> {
        const response = await fetchJson<{ locales: string[] }>(
            xpServiceUrl('externalArchive/locales'),
            { headers: { secret: process.env.SERVICE_SECRET } }
        );
        return response?.locales ?? [];
    }

    private async fetchNodeListPage(locale: string, after: string): Promise<NodeListResult | null> {
        return fetchJson<NodeListResult>(xpServiceUrl('externalArchive/nodeList'), {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { locale, after, count: String(PAGE_SIZE) },
        });
    }

    private async runBackfill(locales: string[], maxNodes?: number): Promise<void> {
        const startTime = Date.now();
        let indexed = 0;
        let failed = 0;

        const reachedLimit = () => maxNodes !== undefined && indexed >= maxNodes;

        for (const locale of locales) {
            // Les lagret cursor – gjenopptar etter OOM-krasj uten å starte fra scratch.
            const savedAfter = this.openSearchClient
                ? await this.openSearchClient.getCursor(locale)
                : '';
            let after = savedAfter;
            if (after) {
                console.log(`Backfill: gjenopptar locale=${locale} fra cursor after=${after}`);
            }
            let hasMore = true;

            while (hasMore && !reachedLimit()) {
                const page = await this.fetchNodeListPage(locale, after);
                if (!page) {
                    console.error(`Backfill: nodeList feilet for locale=${locale} after=${after}`);
                    break;
                }

                for (const node of page.nodes) {
                    if (reachedLimit()) {
                        break;
                    }
                    const ok = await this.indexingService.indexAllVersions(node.id, locale);
                    if (ok) {
                        indexed += 1;
                    } else {
                        failed += 1;
                        console.warn(
                            `Backfill: indexAllVersions feilet for ${node.id} (${locale})`
                        );
                    }
                    if (indexed % 10 === 0) {
                        const elapsed = Math.round((Date.now() - startTime) / 1000);
                        console.log(
                            `Backfill: ${indexed} noder indeksert (${failed} feilet) – ${elapsed}s`
                        );
                        // Lagre cursor periodisk – begrenser tap ved OOM til ~10 noder.
                        if (this.openSearchClient) {
                            await this.openSearchClient.saveCursor(locale, after);
                        }
                    }
                }

                after = page.nextAfter;
                hasMore = page.hasMore;
            }

            if (reachedLimit()) {
                break;
            }

            // Locale ferdig – slett cursor for denne locale.
            if (this.openSearchClient) {
                await this.openSearchClient.clearCursor(locale);
                console.log(`Backfill: cursor slettet for locale=${locale}`);
            }
        }

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`Backfill ferdig: ${indexed} noder indeksert, ${failed} feilet – ${elapsed}s`);
    }

    // Kjøres som naisjob-entrypoint: henter locales, kjører backfill til ferdig, og
    // avslutter prosessen. Gjenopptar automatisk fra lagret cursor ved OOM-restart.
    public async runStandaloneBackfill(): Promise<void> {
        const locales = await this.fetchLocales();
        if (locales.length === 0) {
            console.error('Backfill: ingen locales å kjøre for');
            process.exit(1);
        }
        console.log(`Backfill starter for locales: ${locales.join(', ')}`);
        await this.runBackfill(locales);
        console.log('Backfill fullført – avslutter.');
        process.exit(0);
    }
}

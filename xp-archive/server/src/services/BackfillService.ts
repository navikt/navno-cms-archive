import { RequestHandler } from 'express';
import { fetchJson } from '@common/shared/fetchUtils';
import { xpServiceUrl } from '../utils/urls';
import { IndexingService } from './IndexingService';

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
// indekserer alle versjoner per node. Kjerne-driveren (runBackfill) er gjenbrukbar –
// trigger-endepunktet under er en midlertidig innpakning som en Naisjob erstatter senere.
//
// Pacing: indexAllVersions kjøres SEKVENSIELT (await per node), så vi aldri får N
// samtidige Puppeteer-renders. Cursor-paginering (after/nextAfter) konsumeres slik
// nodeList-kontrakten foreskriver: loop til hasMore er false.
export class BackfillService {
    private readonly indexingService: IndexingService;
    private running = false;

    constructor(indexingService: IndexingService) {
        this.indexingService = indexingService;
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
            let after = '';
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
                    }
                }

                after = page.nextAfter;
                hasMore = page.hasMore;
            }

            if (reachedLimit()) {
                break;
            }
        }

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`Backfill ferdig: ${indexed} noder indeksert, ${failed} feilet – ${elapsed}s`);
        this.running = false;
    }

    // Trigger-endepunkt: starter driveren og svarer 202 med en gang. Driveren kjører
    // videre i prosessen og awaiter hver node sekvensielt. Én kjøring om gangen.
    public backfillHandler: RequestHandler = async (req, res) => {
        if (this.running) {
            res.status(409).json({ message: 'Backfill kjører allerede' });
            return;
        }

        const localesParam = typeof req.query.locales === 'string' ? req.query.locales : '';
        const maxNodesRaw =
            typeof req.query.maxNodes === 'string' ? Number(req.query.maxNodes) : NaN;
        const maxNodes = Number.isFinite(maxNodesRaw) && maxNodesRaw > 0 ? maxNodesRaw : undefined;

        const locales = localesParam
            ? localesParam
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
            : await this.fetchLocales();

        if (locales.length === 0) {
            res.status(400).json({ message: 'Ingen locales å kjøre backfill for' });
            return;
        }

        this.running = true;
        res.status(202).json({ started: true, locales, maxNodes: maxNodes ?? null });

        this.runBackfill(locales, maxNodes).catch((e: unknown) => {
            console.error(`Backfill krasjet: ${e instanceof Error ? e.message : String(e)}`);
            this.running = false;
        });
    };
}

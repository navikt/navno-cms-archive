// Naisjob-entrypoint for backfill av xp-arkivet.
// Startes via `node -r dotenv/config ./dist/server/backfillJob.cjs`.
// Gjenopptar automatisk fra lagret OpenSearch-cursor ved OOM-restart.

import { ContentService } from './services/ContentService';
import { IndexingService } from './services/IndexingService';
import { BackfillService } from './services/BackfillService';
import { BrowserManager } from './services/BrowserManager';
import { XpArchiveOpenSearchClient } from './opensearch/XpArchiveOpenSearchClient';

const requiredEnv = [
    'XP_ORIGIN',
    'SERVICE_SECRET',
    'HTML_RENDER_API',
    'OPEN_SEARCH_URI',
    'OPEN_SEARCH_USERNAME',
    'OPEN_SEARCH_PASSWORD',
] as const;

for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.error(`Mangler påkrevd miljøvariabel: ${key}`);
        process.exit(1);
    }
}

(async () => {
    console.log('Backfill-jobb starter');
    const browserManager = await BrowserManager.create();
    const contentService = new ContentService();
    const openSearchClient = new XpArchiveOpenSearchClient();
    const indexingService = new IndexingService(contentService, openSearchClient, browserManager);
    const backfillService = new BackfillService(indexingService, openSearchClient);

    await backfillService.runStandaloneBackfill();
})().catch((e: unknown) => {
    console.error('Backfill-jobb krasjet:', e instanceof Error ? e.message : String(e));
    process.exit(1);
});

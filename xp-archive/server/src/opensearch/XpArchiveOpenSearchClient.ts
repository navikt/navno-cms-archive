import { Client, errors } from '@opensearch-project/opensearch';
import { getErrorMessage } from '@common/shared/fetchUtils';
import { XpArchiveDocument } from './types';

export const XP_ARCHIVE_INDEX = 'xp-archive-content';

// Eksplisitt mapping. json-bloben lagres men indekseres ikke (enabled: false),
// slik at skjemaløst XP-innhold ikke skaper typekonflikter (f.eks. json.data.audience
// som veksler mellom object og streng på tvers av versjoner). Strengfelt beholder
// text + .keyword-underfelt fordi søket spør på .keyword-stiene.
const stringField = {
    type: 'text',
    fields: { keyword: { type: 'keyword', ignore_above: 256 } },
} as const;

export const XP_ARCHIVE_MAPPINGS = {
    properties: {
        nodeId: stringField,
        versionId: { type: 'keyword' },
        path: { type: 'keyword' },
        displayName: stringField,
        type: stringField,
        locale: stringField,
        timestamp: { type: 'date' },
        modifiedTime: { type: 'date' },
        searchText: { type: 'text' },
        html: { type: 'text' },
        json: { type: 'object', enabled: false },
    },
} as const;

const { OpenSearchClientError, ResponseError } = errors;

//TODO: logException foreløpig duplisert fra legacy-archive
const logException = (e: unknown) => {
    if (e instanceof ResponseError) {
        console.log(
            `OpenSearch response error: status=${e.meta.statusCode} body=${JSON.stringify(e.meta.body)}`
        );
    } else if (e instanceof OpenSearchClientError) {
        console.log(`OpenSearch error: ${e.message} - ${e.stack}`);
    } else {
        console.log(`Unknown error: ${getErrorMessage(e)}`);
    }
};

export class XpArchiveOpenSearchClient {
    private readonly client: Client;
    private indexReady?: Promise<void>;

    constructor() {
        const username = process.env.OPEN_SEARCH_USERNAME;
        const password = process.env.OPEN_SEARCH_PASSWORD;

        this.client = new Client({
            node: process.env.OPEN_SEARCH_URI,
            auth: username && password ? { username, password } : undefined,
        });
    }

    public async ensureIndex(index: string): Promise<void> {
        if (!this.indexReady) {
            this.indexReady = this.createIndexIfMissing(index).catch((e: unknown) => {
                this.indexReady = undefined; // tillat nytt forsøk hvis opprettelsen feilet
                throw e;
            });
        }
        return this.indexReady;
    }

    private async createIndexIfMissing(index: string): Promise<void> {
        const exists = await this.client.indices.exists({ index });
        if (exists.body) {
            return;
        }
        await this.client.indices.create({
            index,
            body: { mappings: XP_ARCHIVE_MAPPINGS },
        });
        console.log(`Created index ${index} with explicit mapping`);
    }

    public async indexDocument(index: string, id: string, document: object): Promise<boolean> {
        return this.client
            .index({ index, id, body: document })
            .then((result) => {
                if (result.statusCode !== 200 && result.statusCode !== 201) {
                    console.error(`Failed to index document: ${result.statusCode}`);
                    return false;
                }
                return true;
            })
            .catch((e: unknown) => {
                logException(e);
                return false;
            });
    }

    public async getDocument<Document>(index: string, id: string): Promise<Document | null> {
        return this.client
            .get({ index, id })
            .then((result) => {
                if (result.statusCode !== 200) {
                    console.error(`Failed to get document: ${result.statusCode}`);
                    return null;
                }
                return (result.body._source as Document) || null;
            })
            .catch((e: unknown) => {
                logException(e);
                return null;
            });
    }

    public async getLatestDocument(
        index: string,
        nodeId: string,
        locale: string
    ): Promise<XpArchiveDocument | null> {
        type SearchBody = {
            hits: { hits: Array<{ _source: XpArchiveDocument }> };
        };

        return this.client
            .search({
                index,
                body: {
                    query: {
                        bool: {
                            filter: [
                                { term: { 'nodeId.keyword': nodeId } },
                                { term: { 'locale.keyword': locale } },
                            ],
                        },
                    },
                    sort: [{ timestamp: { order: 'desc' } }],
                    size: 1,
                },
            })
            .then((result) => {
                const searchBody = result.body as unknown as SearchBody;
                return searchBody.hits.hits[0]?._source ?? null;
            })
            .catch((e: unknown) => {
                logException(e);
                return null;
            });
    }

    public async searchDocuments(
        index: string,
        query: string,
        searchType?: string
    ): Promise<{ total: number; hits: XpArchiveDocument[] }> {
        const curatedTypes = [
            'no.nav.navno:content-page-with-sidemenus',
            'no.nav.navno:themed-article-page',
            'no.nav.navno:situation-page',
            'no.nav.navno:guide-page',
            'no.nav.navno:main-article',
            'no.nav.navno:current-topic-page',
            'no.nav.navno:external-link',
            'no.nav.navno:internal-link',
            'no.nav.navno:product-details',
            'no.nav.navno:global-case-time-set',
            'no.nav.navno:payout-dates',
        ];

        const typeFilter =
            searchType === 'curated'
                ? { terms: { 'type.keyword': curatedTypes } }
                : searchType === 'other'
                  ? { bool: { must_not: { terms: { 'type.keyword': curatedTypes } } } }
                  : null;

        const body = {
            query: {
                bool: {
                    must: {
                        wildcard: {
                            'displayName.keyword': { value: `*${query}*`, case_insensitive: true },
                        },
                    },
                    ...(typeFilter && { filter: typeFilter }),
                },
            },
            collapse: { field: 'nodeId.keyword' },
            sort: [{ timestamp: { order: 'desc' as const } }],
            size: 50,
        };

        type SearchBody = {
            hits: { total: { value: number }; hits: Array<{ _source: XpArchiveDocument }> };
        };

        return this.client
            .search({ index, body })
            .then((result) => {
                const searchBody = result.body as unknown as SearchBody;
                return {
                    total: searchBody.hits.total.value,
                    hits: searchBody.hits.hits.map((h) => h._source),
                };
            })
            .catch((e: unknown) => {
                logException(e);
                return { total: 0, hits: [] };
            });
    }
}

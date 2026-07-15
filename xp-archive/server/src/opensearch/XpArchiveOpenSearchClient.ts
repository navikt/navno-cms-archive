import { Client, errors } from '@opensearch-project/opensearch';
import { getErrorMessage } from '@common/shared/fetchUtils';
import { XpArchiveDocument } from './types';
import { ContentTreeEntryData, XPContentTreeServiceResponse } from '../../../shared/types';
import { getPathName } from '../utils/paths';

// v3: ny indeks trengs for hver mapping-endring (kan ikke endre mapping på en
// eksisterende indeks, og app-brukeren har ikke tilgang til å slette indekser).
// v3 legger til parentPath (eksakt sti til direkte forelder) for å kunne bygge et
// innholdstre fra OpenSearch i stedet for å være avhengig av XP live (se
// docs/arkiv-durabilitet.md). html forblir index: false fra v2.
export const XP_ARCHIVE_INDEX = 'xp-archive-content-v3';

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
        parentPath: { type: 'keyword' },
        displayName: stringField,
        type: stringField,
        locale: stringField,
        timestamp: { type: 'date' },
        modifiedTime: { type: 'date' },
        searchText: { type: 'text' },
        html: { type: 'text', index: false },
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
        // App-brukeren mangler tilgang til HEAD/GET på index-metadata, så vi kan ikke
        // sjekke eksistens først. I stedet forsøker vi å opprette og svelger feilen hvis
        // indeksen allerede finnes (400 resource_already_exists_exception).
        try {
            await this.client.indices.create({
                index,
                body: { mappings: XP_ARCHIVE_MAPPINGS },
            });
            console.log(`Created index ${index} with explicit mapping`);
        } catch (e: unknown) {
            if (
                e instanceof ResponseError &&
                e.meta.statusCode === 400 &&
                JSON.stringify(e.meta.body).includes('resource_already_exists_exception')
            ) {
                return; // indeksen finnes allerede – forventet
            }
            throw e;
        }
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

    private toContentTreeEntry(doc: XpArchiveDocument, numChildren: number): ContentTreeEntryData {
        return {
            id: doc.nodeId,
            versionId: doc.versionId,
            path: doc.path,
            name: getPathName(doc.path),
            displayName: doc.displayName,
            type: doc.type,
            locale: doc.locale,
            numChildren,
            // XP-lag-konsepter vi ikke lagrer i dag (se docs/arkiv-durabilitet.md) – forenklet
            // bevisst i stedet for å late som vi vet svaret.
            isLocalized: true,
            hasLocalizedDescendants: false,
        };
    }

    private buildEmptyContentTreeEntry(
        path: string,
        locale: string,
        numChildren: number
    ): ContentTreeEntryData {
        // Ingen egen arkiv-dokument finnes på denne stien (typisk rot-nivå \u2013
        // node-list.ts enumererer kun etterkommere, aldri roten selv), men noden har
        // barn og må fortsatt kunne navigeres til. Speiler XP sitt eget
        // buildEmptyContentTreeEntry-konsept (content-tree-archive.ts) for strukturelle
        // "tomme" tre-noder.
        return {
            id: path,
            versionId: '',
            path,
            name: getPathName(path),
            displayName: getPathName(path) || 'Forside',
            type: 'base:folder',
            locale,
            numChildren,
            isLocalized: true,
            hasLocalizedDescendants: false,
            isEmpty: true,
        };
    }

    // Bygger et nivå av innholdstreet direkte fra OpenSearch (uten å spørre XP). Se docs/arkiv-durabilitet.md
    // for design/forbehold (rekkefølge på barn er alfabetisk på sti, ikke XP sin authored
    // childOrder).
    //
    // current og children hentes parallelt (uavhengige spørringer). Hvis current mangler
    // et eget dokument MEN har barn (typisk rot-nivå), bygges en syntetisk "tom" node i
    // stedet for å returnere null \u2013 kun genuint ukjente stier (verken dokument eller
    // barn) gir null. numChildren for barna hentes med \u00e9n aggregering på tvers av alle
    // (unngår N+1 kall for å vite om de har egne barn).
    public async getContentTreeLevel(
        index: string,
        path: string,
        locale: string
    ): Promise<XPContentTreeServiceResponse | null> {
        type SearchBody = {
            hits: { hits: Array<{ _source: XpArchiveDocument }> };
        };

        // collapse + sort i spørringene under er det som faktisk velger "siste versjon
        // per node" – denne henter bare ut de rå dokumentene fra svaret.
        const extractDocs = (searchBody: SearchBody) => searchBody.hits.hits.map((h) => h._source);

        try {
            const [currentResult, childrenResult] = await Promise.all([
                this.client.search({
                    index,
                    body: {
                        query: {
                            bool: {
                                filter: [
                                    { term: { path } },
                                    { term: { 'locale.keyword': locale } },
                                ],
                            },
                        },
                        collapse: { field: 'nodeId.keyword' },
                        sort: [{ timestamp: { order: 'desc' } }],
                        size: 1,
                    },
                }),
                this.client.search({
                    index,
                    body: {
                        query: {
                            bool: {
                                filter: [
                                    { term: { parentPath: path } },
                                    { term: { 'locale.keyword': locale } },
                                ],
                            },
                        },
                        collapse: { field: 'nodeId.keyword' },
                        sort: [{ timestamp: { order: 'desc' } }],
                        size: 1000,
                    },
                }),
            ]);

            const currentDoc = extractDocs(currentResult.body as unknown as SearchBody)[0];
            const childDocs = extractDocs(childrenResult.body as unknown as SearchBody);

            if (!currentDoc && childDocs.length === 0) {
                return null;
            }

            // Ett enkelt én-tallsspørsmål per barn ("har du egne barn?") – tregere enn én
            // aggregering på tvers av alle, men langt lettere å lese. Tre-nivåer her er små
            // (typisk titalls barn, ikke tusenvis), så den ekstra rundturen er uproblematisk.
            const childCounts = await Promise.all(
                childDocs.map((doc) =>
                    this.client.count({
                        index,
                        body: { query: { term: { parentPath: doc.path } } },
                    })
                )
            );
            const numChildrenByPath = new Map(
                childDocs.map((doc, i) => [doc.path, childCounts[i].body.count])
            );

            return {
                current: currentDoc
                    ? this.toContentTreeEntry(currentDoc, childDocs.length)
                    : this.buildEmptyContentTreeEntry(path, locale, childDocs.length),
                children: childDocs.map((doc) =>
                    this.toContentTreeEntry(doc, numChildrenByPath.get(doc.path) ?? 0)
                ),
            };
        } catch (e: unknown) {
            logException(e);
            return null;
        }
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
            aggs: {
                // Teller distinkte sider (noder), ikke versjoner, slik at treff-tallet
                // blir per side – som i main. collapse styrer visningen, denne styrer tallet.
                total_pages: { cardinality: { field: 'nodeId.keyword' } },
            },
            sort: [{ timestamp: { order: 'desc' as const } }],
            size: 50,
        };

        type SearchBody = {
            hits: { hits: Array<{ _source: XpArchiveDocument }> };
            aggregations: { total_pages: { value: number } };
        };

        return this.client
            .search({ index, body })
            .then((result) => {
                const searchBody = result.body as unknown as SearchBody;
                return {
                    total: searchBody.aggregations.total_pages.value,
                    hits: searchBody.hits.hits.map((h) => h._source),
                };
            })
            .catch((e: unknown) => {
                logException(e);
                return { total: 0, hits: [] };
            });
    }
}

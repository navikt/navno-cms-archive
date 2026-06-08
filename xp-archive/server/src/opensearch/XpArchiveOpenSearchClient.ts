import { Client, errors } from '@opensearch-project/opensearch';
import {
    Get_Request,
    Index_Request,
    Search_Request,
} from '@opensearch-project/opensearch/api/index.js';
import { getErrorMessage } from '@common/shared/fetchUtils';

type DocumentWithScore<Document> = Document & { _score?: number | string };

export type SearchResult<Document> = {
    hits: Array<DocumentWithScore<Document>>;
    total: number;
};

const { OpenSearchClientError } = errors;

const logException = (e: unknown) => {
    if (e instanceof OpenSearchClientError) {
        console.log(`OpenSearch error: ${e.message} - ${e.stack}`);
    } else {
        console.log(`Unknown error: ${getErrorMessage(e)}`);
    }
};

export class XpArchiveOpenSearchClient {
    private readonly openSearchClient: Client;

    constructor() {
        const { OPEN_SEARCH_URI, OPEN_SEARCH_USERNAME, OPEN_SEARCH_PASSWORD } = process.env;

        this.openSearchClient = new Client({
            node: OPEN_SEARCH_URI,
            auth:
                OPEN_SEARCH_USERNAME && OPEN_SEARCH_PASSWORD
                    ? { username: OPEN_SEARCH_USERNAME, password: OPEN_SEARCH_PASSWORD }
                    : undefined,
        });
    }

    public async indexDocument<Document extends Record<string, unknown>>(
        index: string,
        id: string,
        document: Document
    ): Promise<boolean> {
        const params: Index_Request = {
            index,
            id,
            body: document,
            refresh: true,
        };

        return this.openSearchClient
            .index(params)
            .then((result) => {
                if (result.statusCode !== 200 && result.statusCode !== 201) {
                    console.error(`Error response from index: ${result.statusCode}`, result);
                    return false;
                }

                return true;
            })
            .catch((e: unknown) => {
                logException(e);
                return false;
            });
    }

    public async getDocument<Document>(params: Get_Request): Promise<Document | null> {
        return this.openSearchClient
            .get(params)
            .then((result) => {
                if (result.statusCode !== 200) {
                    console.error(`Error response from get document: ${result.statusCode}`, result);
                    return null;
                }

                return (result.body._source as Document) || null;
            })
            .catch((e: unknown) => {
                logException(e);
                return null;
            });
    }

    public async search<Document>(params: Search_Request): Promise<SearchResult<Document> | null> {
        return this.openSearchClient
            .search(params)
            .then((result) => {
                if (result.statusCode !== 200) {
                    console.error(`Error response from search: ${result.statusCode}`, result);
                    return null;
                }

                const hits = result.body.hits.hits.reduce<DocumentWithScore<Document>[]>(
                    (acc, hit) => {
                        const { _source } = hit;
                        const rawScore = '_score' in hit ? hit._score : undefined;
                        const _score =
                            typeof rawScore === 'number' || typeof rawScore === 'string'
                                ? rawScore
                                : undefined;
                        if (_source) {
                            acc.push({ ...(_source as Document), _score });
                        }

                        return acc;
                    },
                    []
                );

                const total = result.body.hits.total ?? 0;

                return {
                    hits,
                    total: typeof total === 'number' ? total : total?.value,
                };
            })
            .catch((e: unknown) => {
                logException(e);
                return null;
            });
    }
}

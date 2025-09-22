import { Client, errors } from '@opensearch-project/opensearch';
import {
    Get_Request,
    Mget_Request,
    Mget_Response,
    Search_Request,
} from '@opensearch-project/opensearch/api/index.js';

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
        console.log(`Unknown error: ${e}`);
    }
};

export class CmsArchiveOpenSearchClient {
    private readonly openSearchClient: Client;

    constructor() {
        const { OPEN_SEARCH_URI, OPEN_SEARCH_USERNAME, OPEN_SEARCH_PASSWORD } = process.env;

        this.openSearchClient = new Client({
            node: OPEN_SEARCH_URI,
            auth: {
                username: OPEN_SEARCH_USERNAME,
                password: OPEN_SEARCH_PASSWORD,
            },
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
                        const { _source, _score } = hit;
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

    public async getDocuments<Document>(params: Mget_Request): Promise<Document[] | null> {
        return this.openSearchClient
            .mget(params)
            .then((result: Mget_Response) => {
                if (result.statusCode !== 200) {
                    console.error(`Error response from get document: ${result.statusCode}`, result);
                    return null;
                }

                return result.body.docs.reduce<Document[]>((acc, res) => {
                    if ('_source' in res && res._source) {
                        const doc = res._source as Document;
                        acc.push(doc);
                    }

                    return acc;
                }, []);
            })
            .catch((e: unknown) => {
                logException(e);
                return null;
            });
    }
}

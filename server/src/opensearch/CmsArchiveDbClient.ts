import { Client, errors } from '@opensearch-project/opensearch';
import { GetRequest, MgetRequest, SearchRequest } from '@opensearch-project/opensearch/api/types';
// The more thorough type definition for the client are officially "not finished" as of v2.5
// but are good enough for our use
import type { Client as ClientTypeNew } from '@opensearch-project/opensearch/api/new';


const { OpenSearchClientError } = errors;

const logException = (e: unknown) => {
    if (e instanceof OpenSearchClientError) {
        console.log(`OpenSearch error: ${e.message}`);
    } else {
        console.log(`Unknown error: ${e}`);
    }
};

export class CmsArchiveDbClient {
    private readonly openSearchClient: ClientTypeNew;

    constructor() {
        const { OPEN_SEARCH_URI, OPEN_SEARCH_USERNAME, OPEN_SEARCH_PASSWORD } = process.env;

        this.openSearchClient = new Client({
            node: OPEN_SEARCH_URI,
            auth: {
                username: OPEN_SEARCH_USERNAME,
                password: OPEN_SEARCH_PASSWORD,
            },
        }) as unknown as ClientTypeNew;
    }

    public async search<Document>(params: SearchRequest): Promise<Document[] | null> {
        return this.openSearchClient.search<Document>(params).then(result => {
            if (result.statusCode !== 200) {
                console.error(`Error response from search: ${result.statusCode}`, result);
                return null;
            }

            console.log('Search result: ', result.body.hits.total);

            return result.body.hits.hits
                .reduce<Document[]>((acc, { _source }) => {
                    if (_source) {
                        acc.push(_source);
                    }

                    return acc;
                }, []);
        }).catch((e: unknown) => {
            logException(e);
            return null;
        });
    }

    public async getDocument<Document>(params: GetRequest): Promise<Document | null> {
        return this.openSearchClient.get<Document>(params).then(result => {
            if (result.statusCode !== 200) {
                console.error(`Error response from get document: ${result.statusCode}`, result);
                return null;
            }

            return result.body._source || null;
        }).catch((e: unknown) => {
            logException(e);
            return null;
        });
    }

    public async getDocuments<Document>(params: MgetRequest): Promise<Document[] | null> {
        return this.openSearchClient.mget<Document>(params).then(result => {
            if (result.statusCode !== 200) {
                console.error(`Error response from get document: ${result.statusCode}`, result);
                return null;
            }

            return result.body.docs.reduce<Document[]>((acc, { _source }) => {
                if (_source) {
                    acc.push(_source);
                }

                return acc;
            }, []);
        }).catch((e: unknown) => {
            logException(e);
            return null;
        });
    }
}
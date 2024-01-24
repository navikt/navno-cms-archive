import { Client, errors } from '@opensearch-project/opensearch';
import { SearchRequest } from '@opensearch-project/opensearch/api/types';


const { OpenSearchClientError } = errors;

const logException = (e: unknown) => {
    if (e instanceof OpenSearchClientError) {
        console.log(`OpenSearch error: ${e.message}`);
    } else {
        console.log(`Unknown opensearch error: ${e}`);
    }
};

type Props = {
    indexPrefix: string
}

export class CmsArchiveDbClient {
    private readonly openSearchClient: Client;
    private readonly indexPrefix: string;

    constructor({ indexPrefix }: Props) {
        const { OPEN_SEARCH_URI, OPEN_SEARCH_USERNAME, OPEN_SEARCH_PASSWORD } = process.env;

        this.indexPrefix = indexPrefix;

        this.openSearchClient = new Client({
            node: OPEN_SEARCH_URI,
            auth: {
                username: OPEN_SEARCH_USERNAME,
                password: OPEN_SEARCH_PASSWORD,
            },
        });
    }

    public async search<Document>(params: SearchRequest): Promise<Document[] | null> {
        // return this.openSearchClient.search<Document>(params).then(result => {
        //     if (result.statusCode !== 200) {
        //         return null;
        //     }
        //
        //     return result.body.hits.hits
        //         .reduce<Document[]>((acc, { _source }) => {
        //             if (_source) {
        //                 acc.push(_source);
        //             }
        //
        //             return acc;
        //         }, []);
        // }).catch((e: unknown) => {
        //     logException(e);
        //     return null;
        // });
        return null;
    }
}
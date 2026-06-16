import { Client, errors } from '@opensearch-project/opensearch';
import { getErrorMessage } from '@common/shared/fetchUtils';

const { OpenSearchClientError } = errors;

//TODO: logException foreløpig duplisert fra legacy-archive
const logException = (e: unknown) => {
    if (e instanceof OpenSearchClientError) {
        console.log(`OpenSearch error: ${e.message} - ${e.stack}`);
    } else {
        console.log(`Unknown error: ${getErrorMessage(e)}`);
    }
};

export class XpArchiveOpenSearchClient {
    private readonly client: Client;

    constructor() {
        const username = process.env.OPEN_SEARCH_USERNAME;
        const password = process.env.OPEN_SEARCH_PASSWORD;

        this.client = new Client({
            node: process.env.OPEN_SEARCH_URI,
            auth: username && password ? { username, password } : undefined,
        });
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
}

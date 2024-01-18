import { Client } from '@opensearch-project/opensearch';

export class OpenSearchClient {
    private client: Client;

    constructor() {
        const { OPEN_SEARCH_URI, OPEN_SEARCH_USERNAME, OPEN_SEARCH_PASSWORD } = process.env;

        console.log('Opensearch options:', OPEN_SEARCH_URI, OPEN_SEARCH_USERNAME)

        this.client = new Client({
            node: OPEN_SEARCH_URI,
            auth: {
                username: OPEN_SEARCH_USERNAME,
                password: OPEN_SEARCH_PASSWORD
            }
        });
    }

    public async test() {
        return this.client.get({
            index: "cmssbs_migrationlogs",
            id: "01d7a252-3dc2-41d7-9f08-28e1ebd1d26a"
        })
    }
}
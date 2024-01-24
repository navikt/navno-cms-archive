import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';
import express, { Express } from 'express';

type Props = {
    basePath: string
    indexPrefix: string,
    expressApp: Express
}

export class EnonicCmsArchiveSite {
    private readonly basePath: string;
    private readonly openSearchClient: CmsArchiveDbClient;

    constructor({ basePath, indexPrefix, expressApp }: Props) {
        this.basePath = basePath;
        this.openSearchClient = new CmsArchiveDbClient({ indexPrefix });

        this.setupRouting(expressApp);
    }

    private setupRouting(expressApp: Express) {
        const router = express.Router();
        expressApp.use(this.basePath, router);

        router.use('*', (req, res) => {
            return res.send(`Hello world from ${this.basePath}`);
        });
    }
}
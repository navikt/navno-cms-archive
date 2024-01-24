import { CmsArchiveDbClient } from '../opensearch/CmsArchiveDbClient';
import express, { Express } from 'express';
import { CmsArchiveService } from './CmsArchiveService';
import { parseQueryParamsList } from '../utils/queryParams';
import mime from 'mime';

type Props = {
    basePath: string
    indexPrefix: string,
    expressApp: Express,
    dbClient: CmsArchiveDbClient
}

export class CmsArchiveSite {
    private readonly basePath: string;
    private readonly cmsArchiveService: CmsArchiveService;

    constructor({ basePath, indexPrefix, expressApp, dbClient }: Props) {
        this.basePath = basePath;
        this.cmsArchiveService = new CmsArchiveService({ client: dbClient, indexPrefix });

        this.setupApiRoutes(expressApp);
    }

    private setupApiRoutes(expressApp: Express) {
        const router = express.Router();
        expressApp.use(`${this.basePath}/api`, router);

        router.get('/root-categories', async (req, res) => {
            const rootCategories = await this.cmsArchiveService.getRootCategories();
            return res.send(rootCategories);
        });

        router.get('/categories', async (req, res) => {
            const keys = parseQueryParamsList(req.query.keys);
            if (!keys) {
                return res.status(400).send('Required parameter "keys" is not valid');
            }

            const category = await this.cmsArchiveService.getCategories(keys);
            return res.send(category);
        });

        router.get('/content/:contentKey', async (req, res) => {
            const { contentKey } = req.params;

            const content = await this.cmsArchiveService.getContent(contentKey);
            if (!content) {
                return res.status(404).send(`Content with key ${contentKey} not found`);
            }

            return res.send(content);
        });

        router.get('/version/:versionKey', async (req, res) => {
            const { versionKey } = req.params;

            const contentVersion = await this.cmsArchiveService.getContentVersion(versionKey);
            if (!contentVersion) {
                return res.status(404).send(`Content version with key ${versionKey} not found`);
            }

            return res.send(contentVersion);
        });

        router.get('/binary/document/:binaryKey', async (req, res) => {
            const { binaryKey } = req.params;

            const binary = await this.cmsArchiveService.getBinary(binaryKey);
            if (!binary) {
                return res.status(404).send(`Binary with key ${binaryKey} not found`);
            }

            return res.send(binary);
        });

        router.get('/binary/file/:binaryKey', async (req, res) => {
            const { binaryKey } = req.params;

            const binary = await this.cmsArchiveService.getBinary(binaryKey);
            if (!binary) {
                return res.status(404).send(`Binary with key ${binaryKey} not found`);
            }

            const contentType = mime.lookup(binary.filename) || "application/octet-stream";

            return res
                .setHeader('Content-Dispositon', `attachment; filename="${binary.filename}"`)
                .setHeader('Content-Type', contentType)
                .send(Buffer.from(binary.data, 'base64'));
        });

        router.use('*', (req, res) => {
            return res.send(`Hello world from ${this.basePath}`);
        });
    }
}
import { RequestHandler } from 'express';
import { ContentService } from './ContentService';
import { XpArchiveOpenSearchClient } from '../opensearch/XpArchiveOpenSearchClient';
import { XpArchiveDocument } from '../opensearch/types';
import { validateQuery } from '../utils/params';
import { XP_ARCHIVE_INDEX } from '../opensearch/XpArchiveOpenSearchClient';

export class IndexingService {
    private readonly contentService: ContentService;
    private readonly openSearchClient: XpArchiveOpenSearchClient;

    constructor(contentService: ContentService, openSearchClient: XpArchiveOpenSearchClient) {
        this.contentService = contentService;
        this.openSearchClient = openSearchClient;
    }

    private async indexContentVersion(
        nodeId: string,
        locale: string,
        versionId: string
    ): Promise<boolean> {
        const content = await this.contentService.fetchContent(nodeId, locale, versionId, true);

        if (!content) {
            return false;
        }

        const { html, json, versions } = content;
        const version = versions.find((v) => v.versionId === versionId);

        if (!version) {
            console.error(`Version ${versionId} not found in versions list for ${nodeId}`);
            return false;
        }

        const doc: XpArchiveDocument = {
            nodeId,
            versionId,
            path: json._path,
            displayName: json.displayName,
            type: json.type,
            locale,
            timestamp: version.timestamp,
            modifiedTime: json.modifiedTime,
            searchText: '',
            html,
            json,
        };

        if (!html) {
            console.warn(`Indexed without HTML: ${nodeId}:${versionId}`);
        }

        return this.openSearchClient.indexDocument(XP_ARCHIVE_INDEX, `${nodeId}:${versionId}`, doc);
    }

    private async indexAllVersions(nodeId: string, locale: string): Promise<boolean> {
        const versions = await this.contentService.fetchVersions(nodeId, locale);

        if (!versions) {
            return false;
        }

        const results = await Promise.all(
            versions.map((v) => this.indexContentVersion(nodeId, locale, v.versionId))
        );

        return results.every(Boolean);
    }

    public indexContentHandler: RequestHandler = (req, res) => {
        if (req.headers['secret'] !== process.env.SERVICE_SECRET) {
            res.status(401).send('Unauthorized');
            return;
        }

        if (!validateQuery(req.query, ['id', 'locale'], ['versionId'])) {
            res.status(400).send('Missing or invalid parameters');
            return;
        }

        const { id, locale, versionId } = req.query;

        res.status(202).json({ accepted: true });

        const indexPromise = versionId
            ? this.indexContentVersion(id, locale, versionId)
            : this.indexAllVersions(id, locale);

        indexPromise
            .then((success) => {
                if (!success) {
                    console.error(`Indexing failed for ${id}:${versionId ?? 'all'}`);
                }
            })
            .catch((e) => console.error(`Indexing error for ${id}: ${e}`));
    };
}

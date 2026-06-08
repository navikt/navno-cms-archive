import { RequestHandler } from 'express';
import { ContentServiceResponse, XpArchiveDocument } from '../../../shared/types';
import { ContentService } from './ContentService';
import { XpArchiveOpenSearchClient } from '../opensearch/XpArchiveOpenSearchClient';
import { extractSearchText } from '../utils/searchText';
import { validateQuery } from '../utils/params';

const XP_ARCHIVE_CONTENT_INDEX = 'xp-archive-content';

const documentId = (nodeId: string, versionId: string) => `${nodeId}:${versionId}`;

type IndexingServiceDeps = { contentService: ContentService; osClient: XpArchiveOpenSearchClient };

export class IndexingService {
    private readonly contentService: ContentService;
    private readonly osClient: XpArchiveOpenSearchClient;

    constructor({ contentService, osClient }: IndexingServiceDeps) {
        this.contentService = contentService;
        this.osClient = osClient;
    }

    public async indexContentVersion(
        nodeId: string,
        locale: string,
        versionId?: string
    ): Promise<XpArchiveDocument | null> {
        const content = await this.contentService.fetchContent(nodeId, locale, versionId, true);
        if (!content) {
            return null;
        }

        const document = this.buildDocument(nodeId, locale, versionId, content);

        const ok = await this.osClient.indexDocument(
            XP_ARCHIVE_CONTENT_INDEX,
            documentId(document.nodeId, document.versionId),
            document
        );

        return ok ? document : null;
    }

    private buildDocument(
        nodeId: string,
        locale: string,
        versionId: string | undefined,
        content: ContentServiceResponse
    ): XpArchiveDocument {
        const { json, html, versions } = content;
        const resolvedVersionId = versionId ?? json._versionKey;
        const version = versions.find((v) => v.versionId === resolvedVersionId);

        return {
            nodeId,
            versionId: resolvedVersionId,
            path: json._path,
            displayName: json.displayName,
            type: json.type,
            locale,
            timestamp: version?.timestamp ?? json.modifiedTime,
            modifiedTime: json.modifiedTime,
            searchText: extractSearchText(html),
            html,
            json,
        };
    }

    public indexContentHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['id', 'locale'], ['versionId'])) {
            res.status(400).send('Missing or invalid parameters');
            return;
        }

        const { id, locale, versionId } = req.query;

        const document = await this.indexContentVersion(id, locale, versionId);
        if (!document) {
            res.status(502).send('Failed to index content');
            return;
        }

        res.status(200).json({
            indexed: documentId(document.nodeId, document.versionId),
            displayName: document.displayName,
            searchTextLength: document.searchText.length,
        });
    };

    public getArchivedContentHandler: RequestHandler<{
        contentId: string;
        locale: string;
        versionId: string;
    }> = async (req, res, next) => {
        const { contentId, versionId } = req.params;

        const document = await this.osClient.getDocument<XpArchiveDocument>({
            index: XP_ARCHIVE_CONTENT_INDEX,
            id: documentId(contentId, versionId),
        });

        if (!document) {
            next();
            return;
        }

        if (!document.html) {
            res.status(406).send('This content does not have an html representation.');
            return;
        }

        res.send(document.html);
    };
}

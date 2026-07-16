import { fetchJson } from '@common/shared/fetchUtils';
import { XPContentTreeServiceResponse } from '../../../shared/types';
import { xpServiceUrl } from '../utils/urls';
import { RequestHandler } from 'express';
import { validateQuery } from '../utils/params';
import {
    XpArchiveOpenSearchClient,
    XP_ARCHIVE_INDEX,
} from '../opensearch/XpArchiveOpenSearchClient';

export class ContentTreeService {
    private readonly CONTENT_TREE_API = xpServiceUrl('externalArchive/contentTree');
    private readonly openSearchClient?: XpArchiveOpenSearchClient;

    constructor(openSearchClient?: XpArchiveOpenSearchClient) {
        this.openSearchClient = openSearchClient;
    }

    //TODO: slette
    public getContentTreeHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['path', 'locale'])) {
            res.status(400).send('Parameters path and locale are required');
            return;
        }

        const { path, locale } = req.query;

        const contentTreeResponse = await this.fetchContentTree(path, locale);

        res.status(200).json(contentTreeResponse);
    };

    // Midlertidig test-endepunkt: bygger samme respons-form fra OpenSearch i stedet for
    // å spørre XP live (se docs/arkiv-durabilitet.md). Erstatter IKKE getContentTreeHandler
    // – det er en bevisst separat rute til vi har validert dette skikkelig.
    public getContentTreeFromIndexHandler: RequestHandler = async (req, res) => {
        if (!this.openSearchClient) {
            res.status(501).send('OpenSearch ikke konfigurert');
            return;
        }

        if (!validateQuery(req.query, ['path', 'locale'])) {
            res.status(400).send('Parameters path and locale are required');
            return;
        }

        const { path, locale } = req.query;
        const result = await this.openSearchClient.getContentTreeLevel(
            XP_ARCHIVE_INDEX,
            path,
            locale
        );

        if (!result) {
            res.status(404).send('Not found');
            return;
        }

        res.status(200).json(result);
    };

    private async fetchContentTree(path: string, locale: string) {
        const response = await fetchJson<XPContentTreeServiceResponse>(this.CONTENT_TREE_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { path, locale },
        });

        return response;
    }
}

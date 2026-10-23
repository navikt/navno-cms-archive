import { fetchJson } from '@common/shared/fetchUtils';
import { XPContentTreeServiceResponse } from '../../../shared/types';
import { xpServiceUrl } from '../utils/urls';
import { RequestHandler } from 'express';
import { validateQuery } from '../utils/params';
import {
    XpArchiveOpenSearchClient,
    XP_ARCHIVE_INDEX,
} from '../opensearch/XpArchiveOpenSearchClient';
import { readFromIndex } from '../utils/readFromIndex';

export class ContentTreeService {
    private readonly CONTENT_TREE_API = xpServiceUrl('externalArchive/contentTree');
    private readonly openSearchClient?: XpArchiveOpenSearchClient;

    constructor(openSearchClient?: XpArchiveOpenSearchClient) {
        this.openSearchClient = openSearchClient;
    }

    public getContentTreeHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['path', 'locale'])) {
            res.status(400).send('Parameters path and locale are required');
            return;
        }

        const { path, locale } = req.query;

        if (readFromIndex() && this.openSearchClient) {
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
            return;
        }

        const contentTreeResponse = await this.fetchContentTree(path, locale);

        res.status(200).json(contentTreeResponse);
    };

    private async fetchContentTree(path: string, locale: string) {
        const response = await fetchJson<XPContentTreeServiceResponse>(this.CONTENT_TREE_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { path, locale },
        });

        return response;
    }
}

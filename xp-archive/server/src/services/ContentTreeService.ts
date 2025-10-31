import { fetchJson } from '@common/shared/fetchUtils';
import { XPContentTreeServiceResponse } from '../../../shared/types';
import { xpServiceUrl } from '../utils/urls';
import { RequestHandler } from 'express';
import { validateQuery } from '../utils/params';

export class ContentTreeService {
    private readonly CONTENT_TREE_API = xpServiceUrl('externalArchive/contentTree');

    public getContentTreeHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['path', 'locale'])) {
            res.status(400).send('Parameters path and locale are required');
            return;
        }

        const { path, locale } = req.query;

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

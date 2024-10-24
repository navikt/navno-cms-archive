import { fetchJson } from '@common/shared/fetchUtils';
import { XPContentTreeServiceResponse } from '../../../shared/types';
import { xpServiceUrl } from '../utils/urls';
import { RequestHandler } from 'express';

export class ContentTreeService {
    private readonly CONTENT_TREE_API = xpServiceUrl('externalArchive/contentTree');

    public getContentTreeHandler: RequestHandler = async (req, res) => {
        const { path } = req.query;

        if (typeof path !== 'string') {
            return res.status(400).send('Parameter path is required');
        }

        const contentTreeResponse = await this.fetchContentTree(path);

        return res.status(200).json(contentTreeResponse);
    };

    private async fetchContentTree(path: string) {
        const response = await fetchJson<XPContentTreeServiceResponse>(this.CONTENT_TREE_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { path },
        });

        return response;
    }
}

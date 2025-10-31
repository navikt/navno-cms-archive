import { xpServiceUrl } from '../utils/urls';
import { RequestHandler } from 'express';
import { fetchFile, FileResponse } from '@common/shared/fetchUtils';
import { validateQuery } from '../utils/params';
import escape from 'escape-html';

export class ContentIconService {
    private readonly CONTENT_ICON_API = xpServiceUrl('externalArchive/contentIcon');

    private readonly cache: Record<string, FileResponse> = {};

    public getContentIconHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['type'])) {
            res.status(400).send('Parameter type is required');
            return;
        }

        const { type } = req.query;

        const contentIconResponse = await this.getContentIcon(type);
        if (!contentIconResponse) {
            res.status(404).send(`Icon not found for type ${escape(type)}`);
            return;
        }

        res.status(200)
            .setHeader('Content-Disposition', 'inline')
            .setHeader('Content-Type', contentIconResponse.mimeType)
            .send(Buffer.from(contentIconResponse.data));
    };

    private async getContentIcon(type: string) {
        const fromCache = this.cache[type];
        if (fromCache) {
            return fromCache;
        }

        const response = await fetchFile(this.CONTENT_ICON_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { type },
        });

        if (response) {
            this.cache[type] = response;
        }

        return response;
    }
}

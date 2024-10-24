import { xpServiceUrl } from '../utils/urls';
import { RequestHandler } from 'express';
import { fetchFile } from '@common/shared/fetchUtils';

export class ContentIconService {
    private readonly CONTENT_ICON_API = xpServiceUrl('externalArchive/contentIcon');

    public getContentIconHandler: RequestHandler = async (req, res) => {
        const { type } = req.query;
        if (typeof type !== 'string') {
            return res.status(400).send('Parameter type is required');
        }

        const contentIconResponse = await this.fetchContentIcon(type);
        if (!contentIconResponse) {
            return res.status(404).send(`Icon not found for type ${type}`);
        }

        return res
            .status(200)
            .setHeader('Content-Disposition', 'inline')
            .setHeader('content-type', contentIconResponse.mimeType)
            .send(Buffer.from(contentIconResponse.data));
    };

    public getContentIconUrl = (type: string) => {};

    private async fetchContentIcon(type: string) {
        const response = await fetchFile(this.CONTENT_ICON_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { type },
        });

        return response;
    }
}

import { xpServiceUrl } from '../utils/urls';
import { RequestHandler } from 'express';

export class ContentIconService {
    private readonly CONTENT_ICON_API = xpServiceUrl('externalArchive/contentIcon');

    public getContentIconHandler: RequestHandler = async (req, res) => {
        const { type } = req.query;
        if (typeof type !== 'string') {
            return res.status(400).send('Parameter type is required');
        }

        const contentIconResponse = await this.fetchContentIcon(type);

        const body = await contentIconResponse.arrayBuffer();

        return res
            .status(200)
            .setHeader('content-type', contentIconResponse.headers.get('content-type') ?? '')
            .send(Buffer.from(body));
    };

    private async fetchContentIcon(type: string) {
        const response = await fetch(`${this.CONTENT_ICON_API}?type=${type}`, {
            headers: { secret: process.env.SERVICE_SECRET },
        });

        return response;
    }
}

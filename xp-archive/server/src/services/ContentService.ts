import { fetchJson } from '@common/shared/fetchJson';
import { xpServiceUrl } from '../utils/urls';
import { Content, ContentServiceResponse, XPContentServiceResponse } from '../../../shared/types';
import { RequestHandler } from 'express';

export class ContentService {
    private readonly CONTENT_PROPS_API = xpServiceUrl('externalArchive/content');
    private readonly HTML_RENDER_API = process.env.HTML_RENDER_API;

    public getContentHandler: RequestHandler = async (req, res) => {
        const { id, locale } = req.query;

        if (typeof id !== 'string' || typeof locale !== 'string') {
            return res.status(400).send('Parameters "id" and "locale" are required');
        }

        const contentResponse = await this.getCurrentContent(id, locale);

        return res.status(200).json(contentResponse);
    };

    private async getCurrentContent(
        id: string,
        locale = 'no'
    ): Promise<ContentServiceResponse | null> {
        const contentServiceResponse = await fetchJson<XPContentServiceResponse>(
            this.CONTENT_PROPS_API,
            {
                headers: { secret: process.env.SERVICE_SECRET },
                params: { id, locale, branch: 'draft' },
            }
        );

        if (!contentServiceResponse) {
            return null;
        }

        const { contentRaw, contentRenderProps, versions } = contentServiceResponse;

        const html = await this.getContentHtml(contentRenderProps);

        return {
            html,
            json: contentRaw,
            versions,
        };
    }

    private async getContentHtml(contentProps?: Content) {
        if (!contentProps) {
            return undefined;
        }

        return fetch(this.HTML_RENDER_API, {
            headers: {
                secret: process.env.SERVICE_SECRET,
                Accept: 'text/html',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ contentProps }),
        }).then((res) => res.text());
    }
}

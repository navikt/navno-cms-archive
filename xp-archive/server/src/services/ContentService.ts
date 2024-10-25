import { fetchHtml, fetchJson } from '@common/shared/fetchUtils';
import { xpServiceUrl } from '../utils/urls';
import { Content, ContentServiceResponse, XPContentServiceResponse } from '../../../shared/types';
import { RequestHandler } from 'express';
import { validateQuery } from '../utils/params';

export class ContentService {
    private readonly CONTENT_PROPS_API = xpServiceUrl('externalArchive/content');
    private readonly HTML_RENDER_API = process.env.HTML_RENDER_API;

    public getContentHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['id', 'locale'], ['versionId'])) {
            return res.status(400).send('Missing or invalid parameters');
        }

        const { id, locale, versionId } = req.query;

        const contentResponse = await this.fetchContent(id, locale, versionId);

        return res.status(200).json(contentResponse);
    };

    private async fetchContent(
        contentId: string,
        locale: string,
        versionId?: string
    ): Promise<ContentServiceResponse | null> {
        const xpResponse = await fetchJson<XPContentServiceResponse>(this.CONTENT_PROPS_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { id: contentId, locale, versionId },
        });

        if (!xpResponse) {
            return null;
        }

        const { contentRaw, contentRenderProps, versions } = xpResponse;

        const html = (await this.getContentHtml(contentRenderProps)) ?? undefined;

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

        return fetchHtml(this.HTML_RENDER_API, {
            headers: {
                secret: process.env.SERVICE_SECRET,
                Accept: 'text/html',
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({ contentProps }),
        });
    }
}

import { fetchHtml, fetchJson } from '@common/shared/fetchUtils';
import { xpServiceUrl } from '../utils/urls';
import {
    Content,
    ContentServiceResponse,
    VersionReference,
    XPContentServiceResponse,
} from '../../../shared/types';
import { RequestHandler } from 'express';
import { validateQuery } from '../utils/params';
import {
    XP_ARCHIVE_INDEX,
    XpArchiveOpenSearchClient,
} from '../opensearch/XpArchiveOpenSearchClient';
import { XpArchiveDocument } from '../opensearch/types';

export class ContentService {
    private readonly CONTENT_PROPS_API = xpServiceUrl('externalArchive/content');
    private readonly HTML_RENDER_API = process.env.HTML_RENDER_API;
    private readonly openSearchClient = process.env.OPEN_SEARCH_URI
        ? new XpArchiveOpenSearchClient()
        : null;

    public getContentHandler: RequestHandler = async (req, res) => {
        if (!validateQuery(req.query, ['id', 'locale'], ['versionId'])) {
            res.status(400).send('Missing or invalid parameters');
            return;
        }

        const { id, locale, versionId } = req.query;

        const contentResponse = await this.fetchContent(id, locale, versionId);

        res.status(200).json(contentResponse);
    };

    public async fetchContent(
        contentId: string,
        locale: string,
        versionId?: string,
        expandAll?: boolean,
        skipCache?: boolean
    ): Promise<ContentServiceResponse | null> {
        if (this.openSearchClient && !skipCache) {
            const openSearchDocument = versionId
                ? await this.openSearchClient.getDocument<XpArchiveDocument>(
                      XP_ARCHIVE_INDEX,
                      `${contentId}:${versionId}`
                  )
                : await this.openSearchClient.getLatestDocument(
                      XP_ARCHIVE_INDEX,
                      contentId,
                      locale
                  );

            if (openSearchDocument?.locale === locale) {
                const xpVersions = await this.fetchVersions(contentId, locale);
                const versions: VersionReference[] = xpVersions ?? [
                    {
                        versionId: openSearchDocument.versionId,
                        nodeId: openSearchDocument.nodeId,
                        nodePath: openSearchDocument.path,
                        timestamp: openSearchDocument.timestamp,
                        locale: openSearchDocument.locale,
                        displayName: openSearchDocument.displayName,
                        type: openSearchDocument.type,
                    },
                ];

                //TODO: fjern
                console.log('getting from OpenSearch');

                return {
                    html: openSearchDocument.html,
                    json: openSearchDocument.json,
                    versions,
                };
            }
        }

        const xpResponse = await fetchJson<XPContentServiceResponse>(this.CONTENT_PROPS_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { id: contentId, locale, versionId },
        });

        if (!xpResponse) {
            return null;
        }

        const { contentRaw, contentRenderProps, versions } = xpResponse;

        if (contentRenderProps && expandAll) {
            contentRenderProps.expandAll = true;
        }

        // Hvis contentRenderProps mangler valueItems, bruk fra contentRaw som fallback
        if (
            contentRenderProps &&
            contentRaw?.data?.valueItems &&
            Array.isArray(contentRaw.data.valueItems) &&
            Array.isArray(contentRenderProps.data.valueItems) &&
            contentRenderProps.data.valueItems.length === 0
        ) {
            contentRenderProps.data.valueItems = contentRaw.data.valueItems;
        }

        const html = (await this.getContentHtml(contentRenderProps)) ?? undefined;

        return {
            html,
            json: contentRaw,
            versions,
        };
    }

    public async fetchVersions(nodeId: string, locale: string): Promise<VersionReference[] | null> {
        const xpResponse = await fetchJson<XPContentServiceResponse>(this.CONTENT_PROPS_API, {
            headers: { secret: process.env.SERVICE_SECRET },
            params: { id: nodeId, locale },
        });

        return xpResponse?.versions ?? null;
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
            body: JSON.stringify({ contentProps: { ...contentProps, noRedirect: true } }),
        });
    }
}

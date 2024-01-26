import { fetchJson } from './fetchJson.ts';
import { CmsContentDocument } from '../../../common/cms-documents/content.ts';

export const fetchContent =
    (baseUrl: string) =>
    async (contentKey: string): Promise<CmsContentDocument | null> => {
        const url = `${baseUrl}/api/content/${contentKey}`;

        return fetchJson<CmsContentDocument>(url);
    };

export const fetchContentVersion =
    (baseUrl: string) =>
    async (versionKey: string): Promise<CmsContentDocument | null> => {
        const url = `${baseUrl}/api/version/${versionKey}`;

        return fetchJson<CmsContentDocument>(url);
    };

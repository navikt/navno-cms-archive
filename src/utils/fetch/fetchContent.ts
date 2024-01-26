import { fetchJson } from './fetchJson.ts';
import { CmsContentDocument } from '../../../common/cms-documents/content.ts';

export const fetchContent =
    (basePath: string) =>
    async (contentKey: string): Promise<CmsContentDocument | null> => {
        const url = `${window.location.origin}${basePath}/api/content/${contentKey}`;
        return fetchJson<CmsContentDocument>(url);
    };

export const fetchContentVersion =
    (basePath: string) =>
    async (versionKey: string): Promise<CmsContentDocument | null> => {
        const url = `${window.location.origin}${basePath}/api/version/${versionKey}`;
        return fetchJson<CmsContentDocument>(url);
    };

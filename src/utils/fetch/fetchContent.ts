import { fetchJson } from '../fetchJson';
import { CmsContentDocument } from '../../../common/cms-documents/content';

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

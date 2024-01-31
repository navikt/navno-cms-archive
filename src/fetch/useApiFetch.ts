import { useAppState } from '../state/useAppState';
import { fetchJson } from './fetchJson';
import { CmsContentDocument } from '../../common/cms-documents/content';
import { CmsCategory } from '../../common/cms-documents/category';
import { useCallback } from 'react';

const fetchContent = (basePath: string) => async (contentKey: string) =>
    fetchJson<CmsContentDocument>(`${basePath}/api/content/${contentKey}`);

const fetchContentVersion = (basePath: string) => async (versionKey: string) =>
    fetchJson<CmsContentDocument>(`${basePath}/api/version/${versionKey}`);

const fetchCategories =
    (basePath: string) =>
    async (categoryKeys: string[]): Promise<CmsCategory[] | null> =>
        categoryKeys.length > 0
            ? fetchJson<CmsCategory[]>(`${basePath}/api/categories/${categoryKeys.join(',')}`)
            : [];

const fetchCategoryContents = (basePath: string) => async (categoryKey: string) =>
    fetchJson<CmsContentDocument[]>(`${basePath}/api/contentForCategory/${categoryKey}`);

export const useApiFetch = () => {
    const { appContext } = useAppState();
    const { basePath } = appContext;

    return {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchCategoryContents: useCallback(fetchCategoryContents(basePath), [basePath]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchContent: useCallback(fetchContent(basePath), [basePath]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchContentVersion: useCallback(fetchContentVersion(basePath), [basePath]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchCategories: useCallback(fetchCategories(basePath), [basePath]),
    };
};

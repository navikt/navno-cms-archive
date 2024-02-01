import { useAppState } from '../state/useAppState';
import { fetchJson } from './fetchJson';
import { CategoryContentsResponse, CmsContent } from '../../common/cms-documents/content';
import { CmsCategoryListItem } from '../../common/cms-documents/category';
import { useCallback } from 'react';

const fetchContent = (basePath: string) => async (contentKey: string) =>
    fetchJson<CmsContent>(`${basePath}/api/content/${contentKey}`);

const fetchContentVersion = (basePath: string) => async (versionKey: string) =>
    fetchJson<CmsContent>(`${basePath}/api/version/${versionKey}`);

const fetchCategories =
    (basePath: string) =>
    async (categoryKeys: string[]): Promise<CmsCategoryListItem[] | null> =>
        categoryKeys.length > 0
            ? fetchJson<CmsCategoryListItem[]>(
                  `${basePath}/api/categories/${categoryKeys.join(',')}`
              )
            : [];

export type FetchCategoryContentsParams = {
    categoryKey: string;
    from: number;
    size: number;
    query?: string;
};

const fetchCategoryContents =
    (basePath: string) =>
    async ({ categoryKey, from, size, query = '' }: FetchCategoryContentsParams) =>
        fetchJson<CategoryContentsResponse>(
            `${basePath}/api/contentForCategory/${categoryKey}?from=${from}&size=${size}&query=${query?.length > 2 ? query : ''}`
        );

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

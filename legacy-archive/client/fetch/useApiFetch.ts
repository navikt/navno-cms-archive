import { CmsContent } from '../../shared/cms-documents/content';
import { CmsCategoryListItem } from '../../shared/cms-documents/category';
import { useCallback } from 'react';
import { ContentSearchParams, ContentSearchResult } from '../../shared/contentSearch';
import { useAppState } from '../context/app-state/useAppState';
import { fetchJson } from '@common/shared/fetchJson';

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

const fetchSearch = (basePath: string) => async (params: ContentSearchParams) =>
    fetchJson<ContentSearchResult>(`${basePath}/api/search`, { params });

export const useApiFetch = () => {
    const { appContext } = useAppState();
    const { basePath } = appContext;

    return {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchContent: useCallback(fetchContent(basePath), [basePath]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchContentVersion: useCallback(fetchContentVersion(basePath), [basePath]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchCategories: useCallback(fetchCategories(basePath), [basePath]),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchSearch: useCallback(fetchSearch(basePath), [basePath]),
    };
};

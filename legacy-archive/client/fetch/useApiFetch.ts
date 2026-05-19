import { CmsContent } from '../../shared/cms-documents/content';
import { CmsCategoryListItem } from '../../shared/cms-documents/category';
import { useCallback } from 'react';
import { ContentSearchParams, ContentSearchResult } from '../../shared/contentSearch';
import { useAppState } from '../context/app-state/useAppState';
import { fetchJson } from '@common/shared/fetchUtils';

export const useApiFetch = () => {
    const { appContext } = useAppState();
    const { basePath } = appContext;

    const fetchContent = useCallback(
        async (contentKey: string) =>
            fetchJson<CmsContent>(`${basePath}/api/content/${contentKey}`),
        [basePath]
    );

    const fetchContentVersion = useCallback(
        async (versionKey: string) =>
            fetchJson<CmsContent>(`${basePath}/api/version/${versionKey}`),
        [basePath]
    );

    const fetchCategories = useCallback(
        async (categoryKeys: string[]): Promise<CmsCategoryListItem[] | null> =>
            categoryKeys.length > 0
                ? fetchJson<CmsCategoryListItem[]>(
                      `${basePath}/api/categories/${categoryKeys.join(',')}`
                  )
                : [],
        [basePath]
    );

    const fetchSearch = useCallback(
        async (params: ContentSearchParams) =>
            fetchJson<ContentSearchResult>(`${basePath}/api/search`, { params }),
        [basePath]
    );

    return {
        fetchContent,
        fetchContentVersion,
        fetchCategories,
        fetchSearch,
    };
};

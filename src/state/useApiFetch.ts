import { useAppState } from './useAppState';
import { fetchJson } from '../utils/fetchJson';
import { CmsContentDocument } from '../../common/cms-documents/content';
import { CmsCategory } from '../../common/cms-documents/category';

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
        fetchCategoryContents: fetchCategoryContents(basePath),
        fetchContent: fetchContent(basePath),
        fetchContentVersion: fetchContentVersion(basePath),
        fetchCategories: fetchCategories(basePath),
    };
};

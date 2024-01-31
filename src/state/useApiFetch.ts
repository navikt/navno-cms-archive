import { useAppState } from './useAppState';
import { fetchJson } from '../utils/fetchJson';
import { CmsContentDocument } from '../../common/cms-documents/content';

const fetchCategoryContents = (basePath: string) => (categoryKey: string) =>
    fetchJson<CmsContentDocument[]>(
        `${basePath}/api/contentForCategory/${categoryKey}`
    );

const fetchContent = (basePath: string) => (contentKey: string) =>
    fetchJson<CmsContentDocument>(`${basePath}/api/content/${contentKey}`);

export const useApiFetch = () => {
    const { appContext } = useAppState();
    const { basePath } = appContext;

    return {
        fetchCategoryContents: fetchCategoryContents(basePath),
        fetchContent: fetchContent(basePath),
    };
};

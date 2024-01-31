import { fetchJson } from '../fetchJson';
import { CmsCategory } from '../../../common/cms-documents/category';

export const fetchCategories =
    (basePath: string) =>
    async (categoryKeys: string[]): Promise<CmsCategory[] | null> => {
        if (categoryKeys.length === 0) {
            return [];
        }

        const url = `${window.location.origin}${basePath}/api/categories/${categoryKeys.join(',')}`;
        return fetchJson<CmsCategory[]>(url);
    };

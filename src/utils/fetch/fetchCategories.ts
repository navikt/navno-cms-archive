import { fetchJson } from './fetchJson.ts';
import { CmsCategoryDocument } from '../../../common/cms-documents/category.ts';

export const fetchCategories =
    (basePath: string) =>
    async (categoryKeys: string[]): Promise<CmsCategoryDocument[] | null> => {
        if (categoryKeys.length === 0) {
            return [];
        }

        const url = `${window.location.origin}${basePath}/api/categories/${categoryKeys.join(',')}`;
        return fetchJson<CmsCategoryDocument[]>(url);
    };

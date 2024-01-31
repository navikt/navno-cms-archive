import { CmsCategoryListItem } from '../../../../common/cms-documents/category';
import { CmsCategoryDocument } from '../../opensearch/types';

const transformToListItem = (category: CmsCategoryDocument): CmsCategoryListItem => {
    const { key, title, categories, contents } = category;

    return {
        key,
        title,
        categories,
        contentCount: contents.length,
        path: '',
    };
};

export const transformToCategoriesList = (
    categories: CmsCategoryDocument[] | null
): CmsCategoryListItem[] | null => {
    if (!categories) {
        return null;
    }

    return categories.map(transformToListItem).sort((a, b) => (a.title > b.title ? 1 : -1));
};

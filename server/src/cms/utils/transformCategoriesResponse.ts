import { CmsCategory } from '../../../../common/cms-documents/category';
import { CmsCategoryDocument } from '../../opensearch/types';

const sortCategories = (a: CmsCategoryDocument, b: CmsCategoryDocument) =>
    a.title > b.title ? 1 : -1;

const transformCategoryDocument = (category: CmsCategoryDocument) => {
    const { key, title, categories, contents } = category;

    return {
        key,
        title,
        categories,
        contentCount: contents.length,
        path: '',
    };
};

export const transformCategoriesResponse = (
    categories: CmsCategoryDocument[] | null
): CmsCategory[] | null => {
    if (!categories) {
        return null;
    }

    return categories.sort(sortCategories).map(transformCategoryDocument);
};

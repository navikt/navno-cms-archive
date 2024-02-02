import { CmsCategoryListItem } from '../../../../common/cms-documents/category';
import { CmsCategoryDocument } from '../../opensearch/types';
import { CmsArchiveService } from '../CmsArchiveService';

const transformToListItem = async (
    category: CmsCategoryDocument,
    archiveService: CmsArchiveService
): Promise<CmsCategoryListItem> => {
    const { key, title, categories, contents, superKey } = category;

    return {
        key,
        title,
        categories,
        contentCount: contents.length,
        path: superKey ? await archiveService.resolveCategoryPath(superKey) : [],
    };
};

export const transformToCategoriesList = async (
    categories: CmsCategoryDocument[] | null,
    archiveService: CmsArchiveService
): Promise<CmsCategoryListItem[] | null> => {
    if (!categories) {
        return null;
    }

    return Promise.all(
        categories
            .sort((a, b) => (a.title > b.title ? 1 : -1))
            .map(async (category) => transformToListItem(category, archiveService))
    );
};

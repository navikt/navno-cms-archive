import { CmsCategoryDocument } from '../../../common/cms-documents/category';
import { CmsContentDocument } from '../../../common/cms-documents/content';

export const sortCategories = (categories?: CmsCategoryDocument[] | null) =>
    categories?.sort((a, b) => (a.title > b.title ? 1 : -1)) || null;

export const sortContents = (contents?: CmsContentDocument[] | null) =>
    contents?.sort((a, b) => (a.displayName > b.displayName ? 1 : -1)) || null;

import { CmsCategoryRef } from '../../common/cms-documents/_common';

export const buildCategoriesPath = (path: CmsCategoryRef[]) =>
    path.map((segment) => segment.name).join(' / ');

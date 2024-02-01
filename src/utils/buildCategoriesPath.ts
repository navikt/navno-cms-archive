import { CmsCategoryRef } from '../../common/cms-documents/_common';

const arrowChar = '›';

export const buildCategoriesPath = (path: CmsCategoryRef[]) =>
    path.map((segment) => segment.name).join(` ${arrowChar} `);

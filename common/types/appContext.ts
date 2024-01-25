import { CmsCategoryDocument } from './cms-documents/category.ts';

export type AppContext = {
    cmsName: string;
    rootCategories: CmsCategoryDocument[];
};

export const appErrorContext: AppContext = {
    cmsName: 'Lasting av arkiv-data feilet',
    rootCategories: [],
};

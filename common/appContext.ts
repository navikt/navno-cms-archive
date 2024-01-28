import { CmsCategoryDocument } from './cms-documents/category.ts';

export type AppContext = {
    cmsName: string;
    basePath: string;
    rootCategories: CmsCategoryDocument[];
    selectedVersionKey?: string;
};

export const appErrorContext: AppContext = {
    cmsName: 'Lasting av arkiv-data feilet',
    basePath: '',
    rootCategories: [],
};

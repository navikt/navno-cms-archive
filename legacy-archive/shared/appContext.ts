import { CmsCategoryListItem } from './cms-documents/category';

export type AppContext = {
    cmsName: string;
    basePath: string;
    rootCategories: CmsCategoryListItem[];
    selectedVersionKey?: string;
};

export const appErrorContext: AppContext = {
    cmsName: 'Lasting av arkiv-data feilet',
    basePath: '',
    rootCategories: [],
};

import { CmsCategoryDocument } from './cms-documents/category.ts';

export type AppContext = {
    cmsName: string,
    rootCategories: CmsCategoryDocument[]
}
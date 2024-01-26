import React from 'react';
import { CmsCategoryDocument } from '../../../../common/cms-documents/category.ts';
import { Category } from './category/Category.tsx';

type Props = {
    categories: CmsCategoryDocument[];
};

export const CategoriesList = ({ categories }: Props) => {
    return categories.map((category) => (
        <Category category={category} key={category.key} />
    ));
};

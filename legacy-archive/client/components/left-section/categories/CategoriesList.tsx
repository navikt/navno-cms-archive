import React from 'react';
import { CmsCategoryListItem } from '../../../../shared/cms-documents/category';
import { Category } from './category/Category';

type Props = {
    categories: CmsCategoryListItem[];
};

export const CategoriesList = ({ categories }: Props) => {
    return categories.map((category) => <Category category={category} key={category.key} />);
};

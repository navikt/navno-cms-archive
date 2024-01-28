import React from 'react';
import { CmsCategoryDocument } from '../../../../common/cms-documents/category.ts';
import { ChevronDownIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { TreeView } from '@mui/x-tree-view';
import { CategoriesList } from './CategoriesList.tsx';

type Props = {
    rootCategories: CmsCategoryDocument[];
};

export const CategoriesRoot = ({ rootCategories }: Props) => {
    return (
        <TreeView
            defaultExpandIcon={<ChevronRightIcon />}
            defaultCollapseIcon={<ChevronDownIcon />}
        >
            <CategoriesList categories={rootCategories} />
        </TreeView>
    );
};

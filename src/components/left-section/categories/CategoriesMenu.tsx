import React from 'react';
import { CmsCategoryListItem } from '../../../../common/cms-documents/category';
import { ChevronDownIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { TreeView } from '@mui/x-tree-view';
import { CategoriesList } from './CategoriesList';

type Props = {
    rootCategories: CmsCategoryListItem[];
    className?: string;
};

export const CategoriesMenu = ({ rootCategories, className }: Props) => {
    return (
        <TreeView
            defaultExpandIcon={<ChevronRightIcon />}
            defaultCollapseIcon={<ChevronDownIcon />}
            classes={{
                root: className,
            }}
        >
            <CategoriesList categories={rootCategories} />
        </TreeView>
    );
};

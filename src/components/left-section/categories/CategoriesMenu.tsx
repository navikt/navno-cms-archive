import React from 'react';
import { CmsCategoryDocument } from '../../../../common/cms-documents/category';
import { ChevronDownIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { TreeView } from '@mui/x-tree-view';
import { CategoriesList } from './CategoriesList';
import { classNames } from '../../../utils/classNames';

import style from './CategoriesMenu.module.css';

type Props = {
    rootCategories: CmsCategoryDocument[];
};

export const CategoriesMenu = ({ rootCategories }: Props) => {
    return (
        <TreeView
            defaultExpandIcon={<ChevronRightIcon />}
            defaultCollapseIcon={<ChevronDownIcon />}
            className={classNames(style.menuRoot)}
        >
            <CategoriesList categories={rootCategories} />
        </TreeView>
    );
};

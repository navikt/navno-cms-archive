import React from 'react';
import { CmsCategoryListItem } from '../../../../common/cms-documents/category';
import { ChevronDownIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { TreeView } from '@mui/x-tree-view';
import { RootCategory } from './root-category/RootCategory';
import { CheckboxGroup } from '@navikt/ds-react';
import { useSearchState } from '../../../context/search-state/useSearchState';

type Props = {
    rootCategories: CmsCategoryListItem[];
    className?: string;
};

export const CategoriesMenu = ({ rootCategories, className }: Props) => {
    const { updateSearchParams } = useSearchState();

    return (
        <TreeView
            defaultExpandIcon={<ChevronRightIcon />}
            defaultCollapseIcon={<ChevronDownIcon />}
            classes={{
                root: className,
            }}
        >
            <CheckboxGroup
                legend={'Velg kategorier for søket'}
                hideLegend={true}
                onChange={(values) => updateSearchParams({ categoryKeys: values })}
            >
                {rootCategories.map((category) => (
                    <RootCategory category={category} key={category.key} />
                ))}
            </CheckboxGroup>
        </TreeView>
    );
};

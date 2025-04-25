import React from 'react';
import { CmsCategoryListItem } from '../../../../shared/cms-documents/category';
import { SimpleTreeView } from '@mui/x-tree-view';
import { RootCategory } from './root-category/RootCategory';
import { CheckboxGroup } from '@navikt/ds-react';
import { useSearchState } from '../../../context/search-state/useSearchState';

type Props = {
    rootCategories: CmsCategoryListItem[];
    className?: string;
};

export const CategoriesMenu = ({ rootCategories, className }: Props) => {
    const { updateSearchParams, searchParams } = useSearchState();

    return (
        <SimpleTreeView
            classes={{
                root: className,
            }}
        >
            <CheckboxGroup
                legend={'Velg kategorier for søket'}
                hideLegend={true}
                value={searchParams.categoryKeys || []}
                onChange={(values) => updateSearchParams({ categoryKeys: values })}
            >
                {rootCategories.map((category) => (
                    <RootCategory category={category} key={category.key} />
                ))}
            </CheckboxGroup>
        </SimpleTreeView>
    );
};

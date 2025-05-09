import React from 'react';
import { CmsCategoryListItem } from '../../../../../shared/cms-documents/category';
import { Tooltip } from '@navikt/ds-react';
import { TreeItem, TreeItemClasses } from '@mui/x-tree-view';
import { CategoriesList } from '../CategoriesList';
import { ArrowForwardIcon, CircleSlashIcon } from '@navikt/aksel-icons';
import { useFetchCategories } from '../../../../fetch/useFetchCategories';
import { ContentLoader } from '../../../common/loader/ContentLoader';
import { useAppState } from '../../../../context/app-state/useAppState';

import style from './Category.module.css';

const classesOverride: Partial<TreeItemClasses> = {
    content: style.content,
    label: style.label,
    disabled: style.disabled,
    root: style.root,
    iconContainer: style.iconContainer,
} as const;

type Props = {
    category: CmsCategoryListItem;
};

export const Category = ({ category }: Props) => {
    const { key, title, categories, contentCount } = category;
    const childKeys = categories.map((category) => category.key);

    const { setSelectedCategory, setContentSelectorOpen } = useAppState();
    const { isLoading, categories: childCategories } = useFetchCategories(childKeys);

    const hasContent = contentCount > 0;
    const isEmpty = !isLoading && !hasContent && (!childCategories || childCategories.length === 0);

    return (
        <TreeItem
            key={key}
            itemId={key}
            label={
                <Tooltip content={`Nøkkel: ${key}`} placement={'left'} delay={1000}>
                    <div>{`${title}${isEmpty ? ' (tom)' : ''}`}</div>
                </Tooltip>
            }
            disabled={isEmpty}
            slots={{ icon: isEmpty ? CircleSlashIcon : undefined }}
            classes={classesOverride}
        >
            {isLoading ? (
                <ContentLoader
                    size={'xsmall'}
                    text={'Laster underkategorier...'}
                    direction={'row'}
                />
            ) : childCategories ? (
                <CategoriesList categories={childCategories} />
            ) : null}
            {hasContent && (
                <TreeItem
                    itemId={`contents-${key}`}
                    slots={{ icon: ArrowForwardIcon }}
                    label={`Åpne innholdsvelger (${contentCount})`}
                    classes={classesOverride}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedCategory(category);
                        setContentSelectorOpen(true);
                    }}
                />
            )}
        </TreeItem>
    );
};

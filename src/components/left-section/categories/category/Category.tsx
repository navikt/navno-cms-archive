import React from 'react';
import { CmsCategory } from '../../../../../common/cms-documents/category';
import { Tooltip } from '@navikt/ds-react';
import { TreeItem } from '@mui/x-tree-view';
import { CategoriesList } from '../CategoriesList';
import { useAppState } from '../../../../state/useAppState';
import { CircleSlashIcon, FileTextIcon } from '@navikt/aksel-icons';
import { useFetchCategories } from '../../../../fetch/useFetchCategories';
import { ContentLoader } from '../../../common/loader/ContentLoader';

import style from './Category.module.css';

type Props = {
    category: CmsCategory;
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
            nodeId={key}
            label={
                <Tooltip content={key} placement={'left'} delay={500} offset={40}>
                    <div>{`${title}${isEmpty ? ' (tom)' : ''}`}</div>
                </Tooltip>
            }
            className={style.item}
            disabled={isEmpty}
            icon={isEmpty ? <CircleSlashIcon /> : undefined}
        >
            {isLoading ? (
                <ContentLoader size={'xsmall'} text={'Laster underkategorier...'} />
            ) : childCategories ? (
                <CategoriesList categories={childCategories} />
            ) : null}
            {hasContent && (
                <TreeItem
                    nodeId={'contents'}
                    icon={<FileTextIcon />}
                    label={`Vis innhold (${contentCount})`}
                    onClick={(e) => {
                        e.preventDefault();
                        setSelectedCategory(category);
                        setContentSelectorOpen(true);
                    }}
                />
            )}
        </TreeItem>
    );
};

import React from 'react';
import { CmsCategory } from '../../../../../common/cms-documents/category';
import { Loader, Tooltip } from '@navikt/ds-react';
import { TreeItem } from '@mui/x-tree-view';
import useSWRImmutable from 'swr/immutable';
import { fetchCategories } from '../../../../utils/fetch/fetchCategories';
import { CategoriesList } from '../CategoriesList';
import { useAppState } from '../../../../state/useAppState';
import { CircleSlashIcon, FileTextIcon } from '@navikt/aksel-icons';

import style from './Category.module.css';

type Props = {
    category: CmsCategory;
};

export const Category = ({ category }: Props) => {
    const { key, title, categories, contentCount } = category;
    const { appContext, setSelectedCategory, setContentSelectorOpen } =
        useAppState();

    const childKeys = categories.map((category) => category.key);

    const { data: childCategories, isLoading } = useSWRImmutable(
        childKeys,
        fetchCategories(appContext.basePath)
    );

    const hasContent = contentCount > 0;

    const isEmpty =
        !isLoading &&
        !hasContent &&
        (!childCategories || childCategories.length === 0);

    const label = `${title}${isEmpty ? ' (tom)' : ''}`;

    return (
        <TreeItem
            key={key}
            nodeId={key}
            label={
                <Tooltip
                    content={key}
                    placement={'left'}
                    delay={500}
                    offset={40}
                >
                    <div>{label}</div>
                </Tooltip>
            }
            className={style.item}
            disabled={isEmpty}
            icon={isEmpty ? <CircleSlashIcon /> : undefined}
        >
            {isLoading ? (
                <Loader size={'xsmall'} />
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

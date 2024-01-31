import React from 'react';
import { CmsCategoryDocument } from '../../../../../common/cms-documents/category';
import { Loader, Tooltip } from '@navikt/ds-react';
import { TreeItem } from '@mui/x-tree-view';
import useSWRImmutable from 'swr/immutable';
import { fetchCategories } from '../../../../utils/fetch/fetchCategories';
import { CategoriesList } from '../CategoriesList';
import { useAppState } from '../../../../state/useAppState';
import { CircleSlashIcon, FileTextIcon } from '@navikt/aksel-icons';

import style from './Category.module.css';

type Props = {
    category: CmsCategoryDocument;
};

export const Category = ({ category }: Props) => {
    const { key, title, categories, contents } = category;
    const { appContext, setSelectedCategory } = useAppState();

    const childKeys = categories.map((category) => category.key);

    const { data: childCategories, isLoading } = useSWRImmutable(
        childKeys,
        fetchCategories(appContext.basePath)
    );

    const hasContent = contents.length > 0;

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
                    label={`Vis innhold (${contents.length})`}
                    onClick={(e) => {
                        e.preventDefault();
                        setSelectedCategory(category);
                    }}
                />
            )}
        </TreeItem>
    );
};

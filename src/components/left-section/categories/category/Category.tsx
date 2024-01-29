import React from 'react';
import { CmsCategoryDocument } from '../../../../../common/cms-documents/category.ts';
import { Loader, Tooltip } from '@navikt/ds-react';
import { TreeItem } from '@mui/x-tree-view';
import useSWRImmutable from 'swr/immutable';
import { fetchCategories } from '../../../../utils/fetch/fetchCategories.ts';
import { CategoriesList } from '../CategoriesList.tsx';
import { useAppState } from '../../../../state/useAppState.tsx';
import { fetchContent } from '../../../../utils/fetch/fetchContent.ts';
import { CircleSlashIcon, FileTextIcon } from '@navikt/aksel-icons';

import style from './Category.module.css';

type Props = {
    category: CmsCategoryDocument;
};

export const Category = ({ category }: Props) => {
    const { key, title, categories, contents } = category;
    const { setSelectedContent, appContext } = useAppState();

    const childKeys = categories.map((category) => category.key);

    const { data: childCategories, isLoading } = useSWRImmutable(
        childKeys,
        fetchCategories(appContext.basePath)
    );

    const isEmpty =
        !isLoading &&
        (!childCategories || childCategories.length === 0) &&
        contents.length === 0;

    const label = `${title}${contents.length > 0 ? ` (${contents.length})` : isEmpty ? ' (tom)' : ''}`;

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
            {contents.map((content) => (
                <TreeItem
                    key={content.key}
                    nodeId={content.key}
                    label={content.displayName}
                    icon={<FileTextIcon />}
                    onClick={(e) => {
                        e.preventDefault();
                        fetchContent(appContext.basePath)(content.key).then(
                            (res) => {
                                if (res) {
                                    setSelectedContent(res);
                                }
                            }
                        );
                    }}
                />
            ))}
        </TreeItem>
    );
};

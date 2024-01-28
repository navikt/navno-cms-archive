import React from 'react';
import { CmsCategoryDocument } from '../../../../../common/cms-documents/category.ts';
import { BodyLong, Loader } from '@navikt/ds-react';
import { TreeItem, TreeItemContentProps, useTreeItem } from '@mui/x-tree-view';
import useSWRImmutable from 'swr/immutable';
import { fetchCategories } from '../../../../utils/fetch/fetchCategories.ts';
import { CategoriesList } from '../CategoriesList.tsx';
import { classNames } from '../../../../utils/classNames.ts';
import { useAppState } from '../../../../state/useAppState.tsx';
import { fetchContent } from '../../../../utils/fetch/fetchContent.ts';
import { FileTextIcon } from '@navikt/aksel-icons';

import style from './Category.module.css';

type Props = {
    category: CmsCategoryDocument;
};

export const Category = ({ category }: Props) => {
    const { key, title, categories, contents } = category;
    const { setSelectedContent, appContext } = useAppState();

    const childKeys = categories.map((category) => category.key);

    const { data, isLoading } = useSWRImmutable(
        childKeys,
        fetchCategories(appContext.basePath)
    );

    const label = `${title}${contents.length > 0 ? ` (${contents.length})` : ''}`;

    return (
        <TreeItem key={key} nodeId={key} label={label} className={style.item}>
            {isLoading ? (
                <Loader size={'xsmall'} />
            ) : data ? (
                <CategoriesList categories={data} />
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

const CustomContent = React.forwardRef(function CustomContent(
    props: TreeItemContentProps,
    ref
) {
    const {
        classes,
        className,
        label,
        nodeId,
        icon: iconProp,
        expansionIcon,
        displayIcon,
    } = props;

    const {
        disabled,
        expanded,
        selected,
        focused,
        handleExpansion,
        preventSelection,
    } = useTreeItem(nodeId);

    const icon = iconProp || expansionIcon || displayIcon;

    const handleMouseDown = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        preventSelection(event);
    };

    const handleExpansionClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        handleExpansion(event);
    };

    return (
        <div
            className={classNames(className, classes.root, {
                [classes.expanded]: expanded,
                [classes.selected]: selected,
                [classes.focused]: focused,
                [classes.disabled]: disabled,
            })}
            onMouseDown={handleMouseDown}
            ref={ref as React.Ref<HTMLDivElement>}
        >
            <div
                onClick={handleExpansionClick}
                className={classNames(classes.iconContainer, style.icon)}
            >
                {icon}
            </div>
            <BodyLong
                onClick={handleExpansionClick}
                as={'div'}
                className={classes.label}
            >
                {label}
            </BodyLong>
        </div>
    );
});

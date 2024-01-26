import React from 'react';
import { CmsCategoryDocument } from '../../../../../common/cms-documents/category.ts';
import { BodyLong, Loader } from '@navikt/ds-react';
import {
    TreeItem,
    TreeItemContentProps,
    TreeItemProps,
    useTreeItem,
} from '@mui/x-tree-view';
import useSWRImmutable from 'swr/immutable';
import { fetchCategories } from '../../../../utils/fetch/fetchCategories.ts';
import { CategoriesList } from '../CategoriesList.tsx';
import { classNames } from '../../../../utils/classNames.ts';

type Props = {
    category: CmsCategoryDocument;
};

export const Category = ({ category }: Props) => {
    const { key, title, categories, contents } = category;

    const childKeys = categories.map((category) => category.key);

    const { data, isLoading } = useSWRImmutable(
        childKeys,
        fetchCategories('http://localhost:3399/sbs')
    );

    return (
        <TreeItem
            ContentComponent={CustomContent}
            key={key}
            nodeId={key}
            label={title}
        >
            {isLoading ? (
                <Loader size={'xsmall'} />
            ) : data ? (
                <CategoriesList categories={data} />
            ) : null}
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
        handleSelection,
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

    const handleSelectionClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        handleSelection(event);
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
                className={classes.iconContainer}
            >
                {icon}
            </div>
            <BodyLong
                onClick={handleSelectionClick}
                as={'div'}
                className={classes.label}
            >
                {label}
            </BodyLong>
        </div>
    );
});

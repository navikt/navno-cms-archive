import React from 'react';
import { CmsCategoryPath } from '../../../../shared/cms-documents/_common';
import { BodyShort, Tooltip, TooltipProps } from '@navikt/ds-react';
import { classNames } from '../../../../../common/src/client/utils/classNames';

import style from './CategoriesPath.module.css';

type Props = {
    path?: CmsCategoryPath;
    size?: 'normal' | 'small';
    tooltipPosition?: TooltipProps['placement'];
    className?: string;
};

export const CategoriesPath = ({ path, size = 'normal', tooltipPosition, className }: Props) => {
    if (!path || path.length === 0) {
        return null;
    }

    const pathString = buildCategoriesPathString(path, size);

    const PathComponent = (
        <BodyShort
            size={'small'}
            className={classNames(style.path, size === 'small' && style.small, className)}
        >
            {pathString}
        </BodyShort>
    );

    return tooltipPosition ? (
        <Tooltip content={pathString} placement={tooltipPosition} maxChar={1000}>
            {PathComponent}
        </Tooltip>
    ) : (
        PathComponent
    );
};

const ARROW_SMALL = '›';
const ARROW_NORMAL = '🠚';

const buildCategoriesPathString = (path: NonNullable<Props['path']>, size: Props['size']) => {
    const arrow = size === 'small' ? ARROW_SMALL : ARROW_NORMAL;
    return path.map((segment) => segment.name).join(` ${arrow} `);
};

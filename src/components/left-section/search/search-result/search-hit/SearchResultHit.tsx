import React from 'react';
import { ContentSearchHit } from '../../../../../../common/contentSearchResult';
import { ContentLink } from '../../../contents/content-link/ContentLink';
import { CategoriesPath } from '../../../../common/categories-path/CategoriesPath';

import style from './SearchResultHit.module.css';

type Props = {
    hit: ContentSearchHit;
};

export const SearchResultHit = ({ hit }: Props) => {
    const { displayName, path, versionKey, contentKey } = hit;

    return (
        <div className={style.hit}>
            <CategoriesPath
                path={path}
                size={'small'}
                className={style.path}
                tooltipPosition={'top'}
            />
            <ContentLink
                content={{
                    displayName,
                    versionKey,
                    contentKey,
                }}
            />
        </div>
    );
};

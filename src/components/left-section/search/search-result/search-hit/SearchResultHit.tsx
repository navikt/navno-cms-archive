import React from 'react';
import { ContentSearchHit } from '../../../../../../common/contentSearchResult';
import { BodyShort, Tooltip } from '@navikt/ds-react';
import { ContentLink } from '../../../contents/content-link/ContentLink';
import { buildCategoriesPath } from '../../../../../utils/buildCategoriesPath';

import style from './SearchResultHit.module.css';

type Props = {
    hit: ContentSearchHit;
};

export const SearchResultHit = ({ hit }: Props) => {
    const { displayName, path, versionKey, contentKey } = hit;

    const pathAsString = buildCategoriesPath(path);

    return (
        <div className={style.hit}>
            <Tooltip content={pathAsString} placement={'top'}>
                <BodyShort size={'small'} className={style.path}>
                    {pathAsString}
                </BodyShort>
            </Tooltip>
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

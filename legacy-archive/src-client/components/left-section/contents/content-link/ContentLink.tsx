import React, { useState } from 'react';
import { CmsContentListItem } from '../../../../../src-common/cms-documents/content';
import { BodyShort, Link, Loader } from '@navikt/ds-react';
import { useApiFetch } from '../../../../fetch/useApiFetch';
import { useAppState } from '../../../../context/app-state/useAppState';
import { classNames } from '../../../../utils/classNames';

import style from './ContentLink.module.css';

type Props = {
    content: CmsContentListItem;
};

export const ContentLink = ({ content }: Props) => {
    const { setSelectedContent, selectedContent, appContext } = useAppState();
    const { fetchContent } = useApiFetch();

    const [isLoading, setIsLoading] = useState(false);

    const isSelected = selectedContent?.contentKey === content.contentKey;

    return (
        <Link
            key={content.contentKey}
            href={`${appContext.basePath}/${content.versionKey}`}
            className={classNames(style.link, isSelected && style.selected)}
            onClick={(e) => {
                e.preventDefault();
                setIsLoading(true);
                fetchContent(content.contentKey)
                    .then((res) => {
                        if (res) {
                            setSelectedContent(res);
                        }
                    })
                    .finally(() => setIsLoading(false));
            }}
        >
            <BodyShort size={'small'}>{content.displayName}</BodyShort>
            {isLoading && <Loader size={'xsmall'} />}
        </Link>
    );
};

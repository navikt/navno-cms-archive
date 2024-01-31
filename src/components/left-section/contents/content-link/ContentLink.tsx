import React from 'react';
import { CmsContentDocument } from '../../../../../common/cms-documents/content';
import { BodyShort, Link } from '@navikt/ds-react';
import { useApiFetch } from '../../../../state/useApiFetch';
import { useAppState } from '../../../../state/useAppState';
import { ArrowRightIcon } from '@navikt/aksel-icons';

import style from './ContentLink.module.css';

type Props = {
    content: CmsContentDocument;
};

export const ContentLink = ({ content }: Props) => {
    const { setSelectedContent, appContext } = useAppState();
    const { fetchContent } = useApiFetch();

    return (
        <Link
            key={content.contentKey}
            href={`${appContext.basePath}/${content.versionKey}`}
            className={style.link}
            onClick={(e) => {
                e.preventDefault();
                fetchContent(content.contentKey).then((res) => {
                    if (res) {
                        setSelectedContent(res);
                    }
                });
            }}
        >
            <ArrowRightIcon />
            <BodyShort size={'small'}>{content.displayName}</BodyShort>
        </Link>
    );
};
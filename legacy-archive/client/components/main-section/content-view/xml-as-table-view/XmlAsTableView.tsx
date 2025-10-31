import React, { useState, useEffect } from 'react';
import { Alert } from '@navikt/ds-react';
import { classNames } from '../../../../../../common/src/client/utils/classNames';

import { xmlToHtml } from 'shared/xmlToHtml';
import { CmsContent } from 'shared/cms-documents/content';

import style from './XmlAsTableView.module.css';

type Props = {
    content: CmsContent;
    hidden?: boolean;
};

export const XmlAsTableView = ({ content, hidden }: Props) => {
    const [parsedHtml, setParsedHtml] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        xmlToHtml({ content })
            .then((html) => {
                setParsedHtml(html);
            })
            .catch((e) => {
                console.error('Error parsing XML to HTML:', e);
                setError('Det oppstod en feil ved visning av XML som tabell.');
            });
    }, [content]);

    return (
        <div className={classNames(style.container, hidden && style.hidden)}>
            {error ? (
                <Alert variant="error">{error}</Alert>
            ) : (
                <div
                    dangerouslySetInnerHTML={{
                        __html: parsedHtml || 'Det finnes ingen data å vise som tabell.',
                    }}
                />
            )}
        </div>
    );
};

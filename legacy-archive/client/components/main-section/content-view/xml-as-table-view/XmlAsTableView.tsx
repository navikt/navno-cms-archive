import React, { useState, useEffect } from 'react';
import { parseString } from 'xml2js';
import { Alert, Switch, Tooltip } from '@navikt/ds-react';
import { classNames } from '../../../../../../common/src/client/utils/classNames';

import style from './XmlAsTableView.module.css';
import { forceArray } from 'client/utils/forceArray';
import { HeaderData, xmlToHtml } from 'shared/xmlToHtml';
import { CmsContent } from 'shared/cms-documents/content';
import { FunnelFillIcon } from '@navikt/aksel-icons';

type Props = {
    content: CmsContent;
    hidden?: boolean;
};

export const XmlAsTableView = ({ content, hidden }: Props) => {
    const [parsedHtml, setParsedHtml] = useState<any>(null);
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

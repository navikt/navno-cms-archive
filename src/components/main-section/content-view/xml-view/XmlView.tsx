import React from 'react';
import XMLViewer from 'react-xml-viewer';
import { Alert } from '@navikt/ds-react';
import { classNames } from '../../../../utils/classNames.ts';

import style from './XmlView.module.css';

type Props = {
    xml: string;
    hidden?: boolean;
};

export const XmlView = ({ xml, hidden = false }: Props) => {
    return (
        <div className={classNames(style.container, hidden && style.hidden)}>
            <XMLViewer
                xml={xml}
                collapsible={true}
                invalidXml={
                    <Alert variant={'error'}>
                        {'Feil: fant ingen XML for dette innholdet!'}
                    </Alert>
                }
            />
        </div>
    );
};

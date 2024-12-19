import React, { useState } from 'react';
import XMLViewer from 'react-xml-viewer';
import { Alert, Switch, Tooltip } from '@navikt/ds-react';
import { classNames } from '../../../../../../common/src/client/utils/classNames';

import style from './XmlView.module.css';

type Props = {
    xml: string;
    hidden?: boolean;
};

export const XmlView = ({ xml, hidden = false }: Props) => {
    const [collapsible, setCollapsible] = useState(false);

    return (
        <div className={classNames(style.container, hidden && style.hidden)}>
            <Tooltip content={'Toggle ekspanderbare elementer'}>
                <Switch
                    size={'small'}
                    checked={collapsible}
                    position={'right'}
                    hideLabel={true}
                    onClick={() => setCollapsible(!collapsible)}
                    className={style.toggle}
                >
                    {'Expand/collapse'}
                </Switch>
            </Tooltip>
            <div className={style.xmlContainer}>
                <XMLViewer
                    xml={xml}
                    collapsible={collapsible}
                    invalidXml={
                        <Alert variant={'error'}>{'Parsing av XML for innholdet feilet!'}</Alert>
                    }
                />
            </div>
        </div>
    );
};

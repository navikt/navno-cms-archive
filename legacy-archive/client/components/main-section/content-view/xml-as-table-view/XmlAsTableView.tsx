import React, { useState } from 'react';
import XMLViewer from 'react-xml-viewer';
import { Alert, Switch, Tooltip } from '@navikt/ds-react';
import { classNames } from '../../../../../../common/src/client/utils/classNames';

import style from './XmlAsTableView.module.css';

type Props = {
    xml: string;
    hidden?: boolean;
};

export const XmlAsTableView = ({ xml,hidden }: Props) => {

    return (
        <div className={classNames(style.container, hidden && style.hidden)}>
            kommer snart
        </div>
    );
};

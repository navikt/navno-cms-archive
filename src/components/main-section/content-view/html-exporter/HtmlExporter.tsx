import React, { useState } from 'react';
import { CmsContentDocument } from '../../../../../common/cms-documents/content';
import { Button, Checkbox, CheckboxGroup, Heading } from '@navikt/ds-react';
import { classNames } from '../../../../utils/classNames';
import { useAppState } from '../../../../context/app-state/useAppState';
import { ArrowDownRightIcon } from '@navikt/aksel-icons';

import style from './HtmlExporter.module.css';

type Props = {
    content: CmsContentDocument;
    hidden?: boolean;
};

export const HtmlExporter = ({ content, hidden }: Props) => {
    const { appContext } = useAppState();
    const { basePath } = appContext;

    const [versionKeysSelected, setVersionKeysSelected] = useState<string[]>([]);

    const pdfApi = `${basePath}/pdf`;

    const { versionKey, versions } = content;

    return (
        <div className={classNames(style.exporter, hidden && style.hidden)}>
            <div className={style.topRow}>
                <Heading size={'small'} level={'3'}>
                    {'Eksporter til PDF'}
                </Heading>
                <Button
                    variant={'primary'}
                    size={'small'}
                    as={'a'}
                    href={`${pdfApi}/single/${versionKey}`}
                    icon={<ArrowDownRightIcon className={style.downloadCurrentIcon} />}
                    iconPosition={'right'}
                    className={style.downloadCurrent}
                >
                    {'Last ned denne versjonen'}
                </Button>
            </div>
            <Button
                variant={'primary'}
                size={'small'}
                as={'a'}
                href={`${pdfApi}/multi/${versionKeysSelected.join(',')}`}
                disabled={versionKeysSelected.length === 0}
            >
                {'Last ned valgte versjoner'}
            </Button>
            <CheckboxGroup
                legend={'Last ned flere versjoner'}
                size={'small'}
                className={style.checkboxGroup}
                onChange={setVersionKeysSelected}
            >
                {versions.map((version) => {
                    const dateTime = new Date(version.timestamp).toLocaleString('no');
                    return (
                        <Checkbox value={version.key} size={'small'} key={version.key}>
                            {`${version.title} - [${dateTime}]`}
                        </Checkbox>
                    );
                })}
            </CheckboxGroup>
        </div>
    );
};

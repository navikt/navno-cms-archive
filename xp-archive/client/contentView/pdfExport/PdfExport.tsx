import React, { useState } from 'react';
import { DownloadIcon } from '@navikt/aksel-icons';
import { Button, Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { formatTimestamp } from '@common/shared/timestamp';
import style from './PdfExport.module.css';

type Props = {
    versions: VersionReference[];
};
const PDF_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/pdf`;

export const PdfExport = ({ versions }: Props) => {
    const [versionsSelected, setVersionsSelected] = useState<string[]>([]);

    const handleChange = (selectedVersions: string[]) => {
        setVersionsSelected(selectedVersions);
    };
    console.log('versionsSelected', versionsSelected);

    return (
        <>
            <div className={style.wrapper}>
                <CheckboxGroup legend="Versjoner" onChange={handleChange}>
                    {versions.map((v) => (
                        <Checkbox key={v.versionId} value={`${v.nodeId};${v.versionId}`}>
                            {v.displayName} {formatTimestamp(v.timestamp)}{' '}
                        </Checkbox>
                    ))}
                </CheckboxGroup>
            </div>
            <div className={style.downloadBar}>
                <Button
                    variant="secondary-neutral"
                    className={style.button}
                    onClick={() =>
                        window.open(
                            `${PDF_API}?contentId=${versions[0].nodeId}&versionIds=${versionsSelected.join(',')}&locale=no` // TODO: fikse locale
                        )
                    }
                    icon={<DownloadIcon title="Last ned versjon(er)" />}
                >
                    {'Last ned valgte versjoner '}
                </Button>
            </div>
        </>
    );
};

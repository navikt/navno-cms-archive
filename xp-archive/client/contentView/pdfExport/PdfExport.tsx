import React, { useState } from 'react';
import { DownloadIcon } from '@navikt/aksel-icons';
import { Button, Heading, LocalAlert } from '@navikt/ds-react';
import { DataGrid } from '@navikt/ds-react/PREVIEW';
import { VersionReference } from 'shared/types';
import { formatTimestamp, getTimestring } from '@common/shared/timestamp';
import style from './PdfExport.module.css';

type Props = {
    versions: VersionReference[];
    locale: string;
};
const PDF_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/pdf`;

const columns: DataGrid.Columns<VersionReference> = [
    {
        id: 'date',
        header: 'Dato',
        bodyCell: ({ timestamp }) => formatTimestamp(timestamp, true),
    },
    {
        id: 'time',
        header: 'Tid',
        bodyCell: ({ timestamp }) => getTimestring(new Date(timestamp)),
    },
    {
        id: 'name',
        header: 'Navn',
        bodyCell: ({ displayName }) => displayName,
    },
    {
        id: 'unpublished',
        header: 'Avpublisert',
        bodyCell: (v) => (v.unpublishedTime ? formatTimestamp(v.unpublishedTime) : null),
    },
];

export const PdfExport = ({ versions, locale }: Props) => {
    const [versionsSelected, setVersionsSelected] = useState<string[]>([]);
    const [showError, setShowError] = useState(false);

    const updateVersionsSelected = (selected: string[]) => {
        if (showError) setShowError(false);
        setVersionsSelected(selected);
    };

    const onDownloadButtonClick = () => {
        if (versionsSelected.length === 0) {
            setShowError(true);
        } else {
            window.open(`${PDF_API}?versionIds=${versionsSelected.join(',')}&locale=${locale}`);
        }
    };

    return (
        <>
            <div className={style.wrapper}>
                <div className={style.checkboxHeading}>
                    <Heading size="medium"> Versjoner</Heading>
                </div>
                <DataGrid
                    columns={columns}
                    data={versions}
                    getRowId={(v) => v.versionId}
                    selection={{ mode: 'multiple', onSelectedRowIdsChange: updateVersionsSelected }}
                >
                    <DataGrid.Table layout="auto" />
                </DataGrid>
                {showError && (
                    <LocalAlert status="error" className={style.errorAlert}>
                        <LocalAlert.Header>
                            <LocalAlert.Title>Du må velge minimum en versjon</LocalAlert.Title>
                        </LocalAlert.Header>
                    </LocalAlert>
                )}
            </div>

            <div className={style.downloadBar}>
                <Button
                    variant="secondary-neutral"
                    className={style.button}
                    onClick={onDownloadButtonClick}
                    icon={<DownloadIcon title="Last ned versjon(er)" />}
                >
                    {'Last ned valgte versjoner '}
                </Button>
            </div>
        </>
    );
};

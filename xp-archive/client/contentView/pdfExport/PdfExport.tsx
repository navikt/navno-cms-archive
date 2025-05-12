import React, { useState } from 'react';
import { DownloadIcon } from '@navikt/aksel-icons';
import { Button, Checkbox, CheckboxGroup, Heading, HelpText } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { formatTimestamp } from '@common/shared/timestamp';
import style from './PdfExport.module.css';

type Props = {
    versions: VersionReference[];
    locale: string;
};
const PDF_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/pdf`;

export const PdfExport = ({ versions, locale }: Props) => {
    const [versionsSelected, setVersionsSelected] = useState<string[]>([]);
    const [prevClickedIndex, setPrevClickedIndex] = useState(0);
    const [showError, setShowError] = useState(false);

    const onSelectOrDeselectAll = () => {
        versionsSelected.length === versions.length
            ? setVersionsSelected([])
            : setVersionsSelected(versions.map((v) => `${v.nodeId}:${v.versionId}`));
    };

    const onCheckboxClick =
        (versionId: string, clickedIndex: number) => (e: React.MouseEvent<HTMLInputElement>) => {
            if (e.shiftKey) {
                const startIndex = Math.min(clickedIndex, prevClickedIndex);
                const length = Math.abs(clickedIndex - prevClickedIndex) + 1;
                const newSelected = versions
                    .slice(startIndex, startIndex + length)
                    .map((v) => `${v.nodeId}:${v.versionId}`);
                const allSelectedUnique = new Set([...versionsSelected, ...newSelected]);
                setVersionsSelected([...allSelectedUnique]);
            } else {
                const selected = versionsSelected.includes(versionId)
                    ? versionsSelected.filter((v) => v !== versionId)
                    : [...versionsSelected, versionId];
                setVersionsSelected(selected);
            }
            if (showError) setShowError(false);

            setPrevClickedIndex(clickedIndex);
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
                    <HelpText title={'Tips!'}>
                        {
                            'Ved å holde inne ‘shift’-knappen, kan du markere flere versjoner samtidig.'
                        }
                    </HelpText>
                </div>
                <Checkbox onClick={onSelectOrDeselectAll} className={style.selectDeselectAllBox}>
                    {versionsSelected.length === versions.length ? 'Nullstill valg' : 'Velg alle'}
                </Checkbox>
                <CheckboxGroup
                    legend="Versjoner"
                    value={versionsSelected}
                    error={showError ? 'Du må velge minimum en versjon' : undefined}
                    hideLegend
                >
                    {versions.map((v, i) => (
                        <Checkbox
                            onClick={onCheckboxClick(`${v.nodeId}:${v.versionId}`, i)}
                            key={v.versionId}
                            value={`${v.nodeId}:${v.versionId}`}
                            className={style.checkboxGroup}
                        >
                            {v.displayName} {formatTimestamp(v.timestamp)}{' '}
                        </Checkbox>
                    ))}
                </CheckboxGroup>
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

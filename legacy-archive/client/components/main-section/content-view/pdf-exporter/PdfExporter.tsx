import React, { useEffect, useMemo, useState } from 'react';
import { CmsContentDocument } from '../../../../../shared/cms-documents/content';
import { Button, Checkbox, CheckboxGroup, Heading, HelpText, Label } from '@navikt/ds-react';
import { classNames } from '../../../../../../common/src/client/utils/classNames';
import { useAppState } from '../../../../context/app-state/useAppState';
import { ArrowDownRightIcon, DownloadIcon } from '@navikt/aksel-icons';
import { formatTimestamp } from '@common/shared/timestamp';
import { DownloadLink } from './download-link/DownloadLink';

import style from './PdfExporter.module.css';

type VersionsSelectedMap = Record<number, { selected: boolean; versionKey: string }>;

type Props = {
    content: CmsContentDocument;
    hidden?: boolean;
};

export const PdfExporter = ({ content, hidden }: Props) => {
    const { appContext } = useAppState();
    const { basePath } = appContext;
    const pdfApi = document.location.host.includes('localhost')
        ? `http://localhost:3399${basePath}/pdf`
        : `https://cms-arkiv.ansatt.nav.no${basePath}/pdf`;

    const { versionKey: currentVersionKey, versions } = content;

    const versionsSelectedMapNew = useMemo(
        () =>
            Object.values(content.versions).reduce<VersionsSelectedMap>((acc, version, index) => {
                acc[index] = { selected: false, versionKey: version.key };
                return acc;
            }, {}),
        [content]
    );

    const [versionsSelectedMap, setVersionsSelectedMap] =
        useState<VersionsSelectedMap>(versionsSelectedMapNew);
    const [prevClickedIndex, setPrevClickedIndex] = useState(0);
    const [versionKeysSelected, setVersionKeysSelected] = useState<string[]>([]);

    const onCheckboxClick = (clickedIndex: number) => (e: React.MouseEvent<HTMLInputElement>) => {
        if (e.shiftKey) {
            e.preventDefault();

            const length = Math.abs(clickedIndex - prevClickedIndex) + 1;
            const startIndex = Math.min(clickedIndex, prevClickedIndex);

            const changedSelection = Object.entries(versionsSelectedMap)
                .slice(startIndex, startIndex + length)
                .reduce<VersionsSelectedMap>((acc, [index, item]) => {
                    acc[Number(index)] = {
                        versionKey: item.versionKey,
                        selected: true,
                    };
                    return acc;
                }, {});

            setVersionsSelectedMap({ ...versionsSelectedMap, ...changedSelection });
        } else {
            const { versionKey, selected } = versionsSelectedMap[clickedIndex];
            setVersionsSelectedMap({
                ...versionsSelectedMap,
                [clickedIndex]: { versionKey, selected: !selected },
            });
        }

        setPrevClickedIndex(clickedIndex);
    };

    useEffect(() => {
        const versionKeysSelected = Object.values(versionsSelectedMap).reduce<string[]>(
            (acc, item) => {
                if (item.selected) {
                    acc.push(item.versionKey);
                }
                return acc;
            },
            []
        );

        setVersionKeysSelected(versionKeysSelected);
    }, [versionsSelectedMap]);

    useEffect(() => {
        setVersionsSelectedMap(versionsSelectedMapNew);
        setVersionKeysSelected([]);
        setPrevClickedIndex(0);
    }, [versionsSelectedMapNew]);

    return (
        <div className={classNames(style.exporter, hidden && style.hidden)}>
            <div className={style.topRow}>
                <Heading size={'small'} level={'3'}>
                    {'Eksporter til PDF'}
                </Heading>
                <DownloadLink
                    href={`${pdfApi}/single/${currentVersionKey}`}
                    icon={<ArrowDownRightIcon className={style.downloadCurrentIcon} />}
                    small={true}
                >
                    {'Last ned denne versjonen'}
                </DownloadLink>
            </div>
            <div className={style.label}>
                <Label>{'Velg flere versjoner (lastes ned i en samlet zip-fil)'}</Label>
                <HelpText title={'Tips!'}>
                    {
                        'Du kan velge et spenn av versjoner med ett klikk ved å holde inne "shift"-knappen'
                    }
                </HelpText>
            </div>
            <CheckboxGroup
                legend={'Velg versjoner'}
                hideLegend={true}
                size={'small'}
                className={style.checkboxGroup}
                value={versionKeysSelected}
            >
                {versions.map((version, index) => {
                    const dateTime = formatTimestamp(version.timestamp);
                    return (
                        <Checkbox
                            onClick={onCheckboxClick(index)}
                            key={version.key}
                            value={version.key}
                            size={'small'}
                        >
                            {`${version.title} - [${dateTime}]`}
                        </Checkbox>
                    );
                })}
            </CheckboxGroup>
            <div
                className={classNames(
                    style.multiSelectButtons,
                    versionKeysSelected.length === 0 && style.hidden
                )}
            >
                <DownloadLink
                    href={`${pdfApi}/multi/${versionKeysSelected.join(',')}`}
                    icon={<DownloadIcon />}
                    disabled={versionKeysSelected.length === 0}
                >
                    {`Last ned ${versionKeysSelected.length} ${versionKeysSelected.length === 1 ? 'valgt versjon' : 'valgte versjoner'}`}
                </DownloadLink>
                <Button
                    variant={'tertiary-neutral'}
                    size={'xsmall'}
                    onClick={() => setVersionsSelectedMap(versionsSelectedMapNew)}
                >
                    {'Nullstill valg'}
                </Button>
            </div>
        </div>
    );
};

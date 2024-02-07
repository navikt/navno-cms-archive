import React, { useEffect, useState } from 'react';
import { CmsContentDocument } from '../../../../../common/cms-documents/content';
import { Button, Checkbox, CheckboxGroup, Heading, HelpText, Label } from '@navikt/ds-react';
import { classNames } from '../../../../utils/classNames';
import { useAppState } from '../../../../context/app-state/useAppState';
import { ArrowDownRightIcon } from '@navikt/aksel-icons';

import style from './HtmlExporter.module.css';

type VersionsSelectedMap = Record<number, { selected: boolean; versionKey: string }>;

type Props = {
    content: CmsContentDocument;
    hidden?: boolean;
};

export const HtmlExporter = ({ content, hidden }: Props) => {
    const { appContext } = useAppState();
    const { basePath } = appContext;
    const pdfApi = `${basePath}/pdf`;

    const versionsSelectedMapEmpty = Object.values(content.versions).reduce<VersionsSelectedMap>(
        (acc, version, index) => {
            acc[index] = { selected: false, versionKey: version.key };
            return acc;
        },
        {}
    );

    const [versionsSelectedMap, setVersionsSelectedMap] =
        useState<VersionsSelectedMap>(versionsSelectedMapEmpty);
    const [prevClickedIndex, setPrevClickedIndex] = useState(0);
    const [versionKeysSelected, setVersionKeysSelected] = useState<string[]>([]);

    const { versionKey: currentVersionKey, versions } = content;

    const onCheckboxClick = (clickedIndex: number) => (e: React.MouseEvent<HTMLInputElement>) => {
        console.log(`Clicked ${clickedIndex}`);

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

    return (
        <div className={classNames(style.exporter, hidden && style.hidden)}>
            <div className={style.topRow}>
                <Heading size={'small'} level={'3'}>
                    {'Eksporter til PDF'}
                </Heading>
                <Button
                    variant={'tertiary'}
                    size={'small'}
                    as={'a'}
                    href={`${pdfApi}/single/${currentVersionKey}`}
                    icon={<ArrowDownRightIcon className={style.downloadCurrentIcon} />}
                    iconPosition={'right'}
                    className={style.downloadCurrentButton}
                >
                    {'Last ned kun denne versjonen'}
                </Button>
            </div>
            <div className={style.label}>
                <Label>{'Velg flere versjoner (lastes ned i en samlet zip-fil)'}</Label>
                <HelpText>
                    {
                        'Tips: Du kan velge et spenn av versjoner ved å holde inne "shift"-knappen samtidig som du trykker på to adskilte versjoner'
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
                    const dateTime = new Date(version.timestamp).toLocaleString('no');
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
            <div className={style.multiSelectButtons}>
                <Button
                    variant={'primary'}
                    size={'medium'}
                    as={'a'}
                    href={`${pdfApi}/multi/${versionKeysSelected.join(',')}`}
                    disabled={versionKeysSelected.length === 0}
                >
                    {versionKeysSelected.length === 0
                        ? 'Ingen versjoner valgt'
                        : `Last ned ${versionKeysSelected.length} ${versionKeysSelected.length > 1 ? 'valgte versjoner' : 'valgt versjon'}`}
                </Button>
                {versionKeysSelected.length > 0 && (
                    <Button
                        variant={'secondary'}
                        onClick={() => setVersionsSelectedMap(versionsSelectedMapEmpty)}
                    >
                        {'Nullstill valg'}
                    </Button>
                )}
            </div>
        </div>
    );
};

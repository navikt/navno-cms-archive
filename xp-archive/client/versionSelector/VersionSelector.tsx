import React, { ChangeEvent, version } from 'react';
import { Select, UNSAFE_Combobox } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { pruneString } from '@common/shared/pruneString';
import { formatTimestamp } from '@common/shared/timestamp';
import { useAppState } from 'client/context/appState/useAppState';

// function getOptions(versions: VersionReference[]): { label: string; value: string }[] {
//     const sisteVersjon = { label: 'Siste versjon', value: 'Siste versjon' };

//     const mapVersionToOption = versions.map((v) => ({
//         label: `${formatTimestamp(v.timestamp)} - ${pruneString(v.displayName, 100)}`,
//         value: v.versionId,
//     }));
//     return [sisteVersjon, ...mapVersionToOption];
// }

type Props = {
    versions: VersionReference[];
};

export const VersionSelector = ({ versions }: Props) => {
    const { selectedVersion, setSelectedVersion } = useAppState();

    const selectVersion = (e: ChangeEvent<HTMLSelectElement>) => {
        if (!e.target.value) {
            setSelectedVersion(undefined);
        }
        const versionId = e.target.value;
        const nodeId = versions.find((v) => v.versionId === versionId)?.nodeId;
        setSelectedVersion({ nodeId, versionId });
    };

    // const selectVersionC = (versionId: string) => {
    //     if (!versionId) {
    //         setSelectedVersion(undefined);
    //     }
    //     const nodeId = versions.find((v) => v.versionId === versionId)?.nodeId;
    //     setSelectedVersion({ nodeId, versionId });
    // };
    return (
        <>
            {/* <UNSAFE_Combobox
                label={'Versjoner'}
                onChange={selectVersionC}
                value={selectedVersion?.versionId ?? 'Siste versjon'}
                shouldAutocomplete={true}
                options={getOptions(versions)}
                clearButton={false}
            ></UNSAFE_Combobox> */}
            <Select
                label={'Versjoner'}
                onChange={selectVersion}
                value={selectedVersion?.versionId ?? ''}
            >
                <option value={''}>Siste versjon</option>
                {versions.map((version) => (
                    <option key={version.versionId} value={version.versionId}>
                        {`${formatTimestamp(version.timestamp)} - ${pruneString(version.displayName, 100)}`}
                    </option>
                ))}
            </Select>
        </>
    );
};

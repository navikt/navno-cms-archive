import React, { ChangeEvent } from 'react';
import { Select } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { pruneString } from '@common/shared/pruneString';
import { formatTimestamp } from '@common/shared/timestamp';
import { useAppState } from 'client/context/appState/useAppState';

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

    return (
        <Select
            label={'Versjoner'}
            onChange={selectVersion}
            value={selectedVersion?.versionId ?? ''}
        >
            <option value={''}>Siste versjon</option>
            {versions.map((version) => (
                <option key={version.versionId} value={version.versionId}>
                    {`${pruneString(version.displayName, 100)} - [${formatTimestamp(version.timestamp)}]`}
                </option>
            ))}
        </Select>
    );
};

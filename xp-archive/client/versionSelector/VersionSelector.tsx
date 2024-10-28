import React from 'react';
import { Select } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { pruneString } from '@common/shared/pruneString';
import { formatTimestamp } from '@common/shared/timestamp';
import { useAppState } from 'client/context/appState/useAppState';

type Props = {
    displayName: string; // TODO: Burde komme fra versjon?
    versions: VersionReference[];
};

export const VersionSelector = ({ displayName, versions }: Props) => {
    const { selectedVersionId, setSelectedVersionId } = useAppState();

    if (versions.length === 0) {
        return null;
    }

    return (
        <Select
            label={'Versjoner'}
            onChange={(e) => setSelectedVersionId(e.target.value)}
            value={selectedVersionId ?? ''}
        >
            {versions.map((version) => (
                <option key={version.versionId} value={version.versionId}>
                    {`${pruneString(displayName, 100)} - [${formatTimestamp(version.timestamp)}]`}
                </option>
            ))}
        </Select>
    );
};

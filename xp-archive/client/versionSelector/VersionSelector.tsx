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
    const { selectedVersionId, setSelectedVersionId } = useAppState();

    if (versions.length === 0) {
        return null;
    }

    const selectVersion = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedVersionId(e.target.value || undefined);
    };

    return (
        <Select label={'Versjoner'} onChange={selectVersion} value={selectedVersionId ?? ''}>
            <option value={''}>Siste versjon</option>
            {versions.map((version) => (
                <option key={version.versionId} value={version.versionId}>
                    {`${pruneString(version.displayName, 100)} - [${formatTimestamp(version.timestamp)}]`}
                </option>
            ))}
        </Select>
    );
};

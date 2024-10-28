import React from 'react';
import { Select } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { pruneString } from '@common/shared/pruneString';
import { formatTimestamp } from '@common/shared/timestamp';

type Props = {
    displayName: string; // TODO: Burde komme fra versjon?
    versions: VersionReference[];
};

export const VersionSelector = ({ displayName, versions }: Props) => {
    if (versions.length === 0) {
        return null;
    }

    return (
        <Select label={'Versjoner'}>
            {versions.map((version) => (
                <option key={version.versionId} value={version.versionId}>
                    {`${pruneString(displayName, 100)} - [${formatTimestamp(version.timestamp)}]`}
                </option>
            ))}
        </Select>
    );
};

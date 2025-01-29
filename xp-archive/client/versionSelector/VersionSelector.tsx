import React, { ChangeEvent } from 'react';
import { Select } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { pruneString } from '@common/shared/pruneString';
import { formatTimestamp } from '@common/shared/timestamp';
import { useAppState } from 'client/context/appState/useAppState';
import { updateContentUrl } from 'client/contentTree/contentTreeEntry/NavigationItem';

type Props = {
    versions: VersionReference[];
};

export const VersionSelector = ({ versions }: Props) => {
    const {
        selectedContentId,
        setSelectedContentId,
        selectedVersion,
        setSelectedVersion,
        selectedLocale,
    } = useAppState();

    const selectVersion = (e: ChangeEvent<HTMLSelectElement>) => {
        const versionId = e.target.value;
        const nodeId = versions.find((v) => v.versionId === versionId)?.nodeId;
        if (nodeId) setSelectedContentId(nodeId);
        updateContentUrl(selectedContentId ?? '', selectedLocale, versionId);
        setSelectedVersion(versionId);
    };

    return (
        <Select label={'Versjoner'} onChange={selectVersion} value={selectedVersion ?? ''}>
            <option value={''}>Siste versjon</option>
            {versions.map((version) => (
                <option key={version.versionId} value={version.versionId}>
                    {`${formatTimestamp(version.timestamp)} - ${pruneString(version.displayName, 100)}`}
                </option>
            ))}
        </Select>
    );
};

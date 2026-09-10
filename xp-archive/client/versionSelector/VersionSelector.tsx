import React, { useState } from 'react';
import { CheckmarkIcon } from '@navikt/aksel-icons';
import { Heading, Button, TextField, Detail } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { formatTimestamp } from '@common/shared/timestamp';
import { useAppState } from 'client/context/appState/useAppState';
import style from './VersionSelector.module.css';

type VersionButtonProps = {
    version: VersionReference;
    isSelected: boolean;
    isLatest: boolean;
    onClick: () => void;
};

const VersionButton = ({ version, isSelected, isLatest, onClick }: VersionButtonProps) => {
    return (
        <Button
            variant="tertiary"
            data-color={'neutral'}
            className={style.versionButton}
            onClick={onClick}
            icon={isSelected && <CheckmarkIcon />}
            iconPosition="left"
        >
            {formatTimestamp(version.timestamp)}
            {isLatest ? <span style={{ fontWeight: 'normal' }}> (Siste versjon)</span> : null}
            {version.unpublishedTime ? (
                <Detail className={style.unpublished}>Avpublisert</Detail>
            ) : null}
        </Button>
    );
};

type Props = {
    versions: VersionReference[];
};

export const VersionSelector = ({ versions }: Props) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { selectedVersion, updateSelectedContent } = useAppState();
    const versionSelected = selectedVersion || versions[0].versionId;

    const selectVersion = (versionId: string) => {
        const node = versions.find((v) => v.versionId === versionId);
        if (node) {
            updateSelectedContent({
                contentId: node.nodeId,
                versionId: versionId,
                locale: node.locale,
            });
        }
    };

    const filteredVersions = versions.filter((version) =>
        formatTimestamp(version.timestamp).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={style.versionSelector}>
            <div>
                <div className={style.top}>
                    <span className={style.heading}>
                        <Heading size="xsmall" spacing>
                            Versjoner
                        </Heading>
                    </span>
                </div>
                <TextField
                    label="Søk i versjoner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={style.search}
                    hideLabel
                />
            </div>
            <div className={style.versionList}>
                {filteredVersions.map((version, index) => (
                    <VersionButton
                        key={version.versionId}
                        version={version}
                        isSelected={version.versionId === versionSelected}
                        onClick={() => selectVersion(version.versionId)}
                        isLatest={index === 0}
                    />
                ))}
            </div>
        </div>
    );
};

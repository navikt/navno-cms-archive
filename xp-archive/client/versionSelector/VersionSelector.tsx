import React, { useState, useEffect } from 'react';
import { Heading, Button, Search } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { formatTimestamp } from '@common/shared/timestamp';
import { useAppState } from 'client/context/appState/useAppState';
import { SlidePanel } from './SlidePanel/SlidePanel';
import { classNames } from '@common/client/utils/classNames';
import style from './VersionSelector.module.css';
import { CheckmarkIcon } from '@navikt/aksel-icons';

type Props = {
    versions: VersionReference[];
    isOpen: boolean;
    onClose: () => void;
    onMount?: (component: React.ReactNode) => void;
};

type VersionButtonProps = {
    isSelected: boolean;
    onClick: () => void;
    children: React.ReactNode;
};

const VersionButton = ({ isSelected, onClick, children }: VersionButtonProps) => (
    <Button
        variant="tertiary"
        className={classNames(style.versionButton, isSelected && style.selected)}
        onClick={onClick}
        icon={isSelected && <CheckmarkIcon />}
        iconPosition="right"
    >
        {children}
    </Button>
);

export const VersionSelector = ({ versions, isOpen, onClose, onMount }: Props) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { setSelectedContentId, selectedVersion, setSelectedVersion } = useAppState();

    const handleClose = () => {
        onClose();
    };

    const selectVersion = (versionId: string) => {
        const nodeId = versions.find((v) => v.versionId === versionId)?.nodeId;
        if (nodeId) setSelectedContentId(nodeId);
        setSelectedVersion(versionId);
    };

    const filteredVersions = versions.filter((version) =>
        formatTimestamp(version.timestamp).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Reset search when versions change completely
    useEffect(() => {
        if (
            versions.length > 0 &&
            filteredVersions.length > 0 &&
            versions[0].nodeId !== filteredVersions[0].nodeId
        ) {
            setSearchQuery('');
        }
    }, [versions]);

    const component = (
        <SlidePanel isOpen={isOpen} onClose={handleClose}>
            <Heading size="medium" spacing>
                Versjoner
            </Heading>
            <Search
                label="Søk i versjoner"
                variant="simple"
                value={searchQuery}
                onChange={setSearchQuery}
                className={style.search}
            />
            <div className={style.versionList}>
                {filteredVersions.map((version, index) => (
                    <VersionButton
                        key={version.versionId}
                        isSelected={version.versionId === selectedVersion}
                        onClick={() => selectVersion(version.versionId)}
                    >
                        {formatTimestamp(version.timestamp)}
                        {index === 0 && (
                            <span style={{ fontWeight: 'normal' }}> (Siste versjon)</span>
                        )}
                    </VersionButton>
                ))}
            </div>
        </SlidePanel>
    );

    // Call onMount with the component
    useEffect(() => {
        if (onMount) {
            onMount(component);
        }
    }, [versions, isOpen, searchQuery, selectedVersion]);

    return component;
};

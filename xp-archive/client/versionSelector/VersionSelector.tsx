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

// Storage key for persisting version selector state
const getStorageKey = (contentId: string) => `versionSelector_state_${contentId}`;

export const VersionSelector = ({ versions, isOpen, onClose, onMount }: Props) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { setSelectedContentId, selectedVersion, setSelectedVersion, selectedContentId } =
        useAppState();
    const storageKey = getStorageKey(selectedContentId || '');

    // Load search query from localStorage on mount
    useEffect(() => {
        if (isOpen) {
            try {
                const savedState = localStorage.getItem(storageKey);
                if (savedState) {
                    const { searchQuery: savedQuery } = JSON.parse(savedState);
                    if (savedQuery) {
                        setSearchQuery(savedQuery);
                    }
                }
            } catch (e) {
                console.error('Failed to load version selector state', e);
            }
        }
    }, [isOpen, storageKey]);

    // Save state to localStorage when it changes
    useEffect(() => {
        if (isOpen) {
            try {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify({
                        searchQuery,
                        selectedVersion,
                    })
                );
            } catch (e) {
                console.error('Failed to save version selector state', e);
            }
        }
    }, [isOpen, searchQuery, selectedVersion, storageKey]);

    const handleClose = () => {
        // Don't clear search query when closing
        onClose();
    };

    const selectVersion = (versionId: string) => {
        const nodeId = versions.find((v) => v.versionId === versionId)?.nodeId;
        if (nodeId) setSelectedContentId(nodeId);
        setSelectedVersion(versionId);

        // Save selected version to localStorage
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    searchQuery,
                    selectedVersion: versionId,
                    keepOpen: true, // Flag to keep panel open
                })
            );
        } catch (e) {
            console.error('Failed to save version selection', e);
        }
    };

    const filteredVersions = versions.filter((version) =>
        formatTimestamp(version.timestamp).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Call onMount with the rendered component
    useEffect(() => {
        if (onMount) {
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
            onMount(component);
        }
    }, [versions, isOpen, searchQuery, selectedVersion]);

    // Add a useEffect to update the filtered versions when the input versions change
    useEffect(() => {
        // Reset search query when versions change completely (different content)
        if (
            versions.length > 0 &&
            filteredVersions.length > 0 &&
            versions[0].nodeId !== filteredVersions[0].nodeId
        ) {
            setSearchQuery('');
        }
    }, [versions]);

    // Return the same component
    return (
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
};

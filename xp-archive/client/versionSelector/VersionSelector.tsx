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
const STORAGE_KEY = 'versionSelector_state';

export const VersionSelector = ({ versions, isOpen, onClose }: Props) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { setSelectedContentId, selectedVersion, setSelectedVersion } = useAppState();

    // Load search query from localStorage on mount
    useEffect(() => {
        if (isOpen) {
            try {
                const savedState = localStorage.getItem(STORAGE_KEY);
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
    }, [isOpen]);

    // Save state to localStorage when it changes
    useEffect(() => {
        if (isOpen) {
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                        searchQuery,
                        selectedVersion,
                    })
                );
            } catch (e) {
                console.error('Failed to save version selector state', e);
            }
        }
    }, [isOpen, searchQuery, selectedVersion]);

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
                STORAGE_KEY,
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

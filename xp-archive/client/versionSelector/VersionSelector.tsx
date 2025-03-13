import React, { useState } from 'react';
import { Heading, Button, Search } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { formatTimestamp } from '@common/shared/timestamp';
import { useAppState } from 'client/context/appState/useAppState';
import { SlidePanel } from './SlidePanel/SlidePanel';
import { classNames } from '@common/client/utils/classNames';
import style from './VersionSelector.module.css';
import { CheckmarkIcon, XMarkIcon } from '@navikt/aksel-icons';

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

export const VersionSelector = ({ versions, isOpen, onClose }: Props) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { selectedVersion, setSelectedVersion } = useAppState();

    const handleClose = () => {
        setSearchQuery('');
        onClose();
    };

    const selectVersion = (versionId: string) => {
        setSelectedVersion(versionId);

        // Update URL without page reload
        const newUrl = `${window.location.pathname.split('/').slice(0, 4).join('/')}/${versionId}`;
        window.history.pushState({}, '', newUrl);
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
            <Button
                className={style.closeButton}
                variant="primary-neutral"
                icon={<XMarkIcon />}
                onClick={handleClose}
            >
                Lukk versjonsvelger
            </Button>
        </SlidePanel>
    );
};

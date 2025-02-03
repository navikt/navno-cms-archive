import React from 'react';
import { Heading, Button } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { formatTimestamp } from '@common/shared/timestamp';
import { useAppState } from 'client/context/appState/useAppState';
import { updateContentUrl } from 'client/contentTree/contentTreeEntry/NavigationItem';
import { SlidePanel } from '../components/SlidePanel';
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

export const VersionSelector = ({ versions, isOpen, onClose }: Props) => {
    const {
        selectedContentId,
        setSelectedContentId,
        selectedVersion,
        setSelectedVersion,
        selectedLocale,
    } = useAppState();

    const selectVersion = (versionId: string) => {
        const nodeId = versions.find((v) => v.versionId === versionId)?.nodeId;
        if (nodeId) setSelectedContentId(nodeId);
        updateContentUrl(selectedContentId ?? '', selectedLocale, versionId);
        setSelectedVersion(versionId);
        onClose();
    };

    return (
        <SlidePanel isOpen={isOpen} onClose={onClose}>
            <Heading size="medium" spacing>
                Versjoner
            </Heading>
            <div className={style.versionList}>
                <VersionButton isSelected={!selectedVersion} onClick={() => selectVersion('')}>
                    Siste versjon
                </VersionButton>
                {versions.map((version) => (
                    <VersionButton
                        key={version.versionId}
                        isSelected={version.versionId === selectedVersion}
                        onClick={() => selectVersion(version.versionId)}
                    >
                        {formatTimestamp(version.timestamp)}
                    </VersionButton>
                ))}
            </div>
        </SlidePanel>
    );
};

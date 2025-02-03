import React from 'react';
import { Heading, Button } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { formatTimestamp } from '@common/shared/timestamp';
import { useAppState } from 'client/context/appState/useAppState';
import { updateContentUrl } from 'client/contentTree/contentTreeEntry/NavigationItem';
import { SlidePanel } from '../components/SlidePanel';
import { classNames } from '@common/client/utils/classNames';
import style from './VersionSelector.module.css';

type Props = {
    versions: VersionReference[];
    isOpen: boolean;
    onClose: () => void;
};

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
                <Button
                    variant="tertiary"
                    className={classNames(style.versionButton, !selectedVersion && style.selected)}
                    onClick={() => selectVersion('')}
                >
                    Siste versjon
                </Button>
                {versions.map((version) => (
                    <Button
                        key={version.versionId}
                        variant="tertiary"
                        className={classNames(
                            style.versionButton,
                            version.versionId === selectedVersion && style.selected
                        )}
                        onClick={() => selectVersion(version.versionId)}
                    >
                        {formatTimestamp(version.timestamp)}
                    </Button>
                ))}
            </div>
        </SlidePanel>
    );
};

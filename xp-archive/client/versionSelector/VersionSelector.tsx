import React, { useState } from 'react';
import { CheckmarkIcon, XMarkIcon } from '@navikt/aksel-icons';
import { Heading, Button, Search } from '@navikt/ds-react';
import { VersionReference } from 'shared/types';
import { formatTimestamp } from '@common/shared/timestamp';
import { useAppState } from 'client/context/appState/useAppState';
import { classNames } from '@common/client/utils/classNames';
import style from './VersionSelector.module.css';

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

type Props = {
    versions: VersionReference[];
    onClose: () => void;
};

export const VersionSelector = ({ versions, onClose }: Props) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { selectedVersion, updateSelectedContent } = useAppState();
    const versionSelected = selectedVersion || versions[0].versionId;

    const handleClose = () => {
        setSearchQuery('');
        onClose();
    };

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
        <>
            <div className={style.headingAndFilter}>
                <div className={style.heading}>
                    <Heading size="xsmall" spacing>
                        Versjoner
                    </Heading>
                    <Button
                        variant="tertiary-neutral"
                        icon={<XMarkIcon />}
                        onClick={handleClose}
                    ></Button>
                </div>
                <Search
                    label="Søk i versjoner"
                    variant="simple"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className={style.search}
                />
            </div>
            <div className={style.versionList}>
                {filteredVersions.map((version, index) => (
                    <VersionButton
                        key={version.versionId}
                        isSelected={version.versionId === versionSelected}
                        onClick={() => selectVersion(version.versionId)}
                    >
                        {formatTimestamp(version.timestamp)}
                        {index === 0 && (
                            <span style={{ fontWeight: 'normal' }}> (Siste versjon)</span>
                        )}
                    </VersionButton>
                ))}
            </div>
        </>
    );
};

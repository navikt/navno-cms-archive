import React from 'react';
import { VersionSelector } from './VersionSelector';
import { VersionReference } from 'shared/types';

type Props = {
    versions: VersionReference[];
    isOpen: boolean;
    onClose: () => void;
};

export const MemoizedVersionSelector = React.memo(
    ({ versions, isOpen, onClose }: Props) => {
        return <VersionSelector versions={versions} isOpen={isOpen} onClose={onClose} />;
    },
    (prevProps, nextProps) => {
        // Only re-render if isOpen changes or versions array changes reference
        return prevProps.isOpen === nextProps.isOpen && prevProps.versions === nextProps.versions;
    }
);

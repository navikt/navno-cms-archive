import React from 'react';
import { Loader } from '@navikt/ds-react';
import { useAppState } from 'client/context/appState/useAppState';
import { useFetchAttachment } from 'client/hooks/useFetchAttachment';
import { FilePreview } from './FilePreview';

type Props = {
    name: string;
    id: string;
    versionId: string;
};

export const FilePreviewWrapper = ({ name, id, versionId }: Props) => {
    const { selectedLocale } = useAppState();

    const { data, isLoading } = useFetchAttachment({
        id,
        versionId,
        locale: selectedLocale,
    });

    return (
        <>
            {isLoading ?? <Loader />}
            {data && <FilePreview name={name} file={data} />}
        </>
    );
};

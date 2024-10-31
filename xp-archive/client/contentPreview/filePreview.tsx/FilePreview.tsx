import React from 'react';
import { Loader } from '@navikt/ds-react';
import { useAppState } from 'client/context/appState/useAppState';
import { FileResponse } from '@common/shared/fetchUtils';
import { useFetchAttachment } from 'client/hooks/useFetchAttachment';
import style from './FilePreview.module.css';

type Props = {
    id: string;
    versionId: string;
};

export const FilePreview = ({ id, versionId }: Props) => {
    const { selectedLocale } = useAppState();

    const { data, isLoading } = useFetchAttachment({
        id,
        versionId,
        locale: selectedLocale,
    });

    return (
        <>
            {isLoading ?? <Loader />}
            {data && <Preview file={data} />}
        </>
    );
};

const Preview = ({ file }: { file: FileResponse }) => {
    const blob = new Blob([file.data], { type: file.mimeType });
    const blobURL = URL.createObjectURL(blob);

    return <iframe className={style.iframe} src={blobURL} />;
};

import React, { useEffect, useState } from 'react';
import { Link } from '@navikt/ds-react';
import { DownloadIcon } from '@navikt/aksel-icons';
import { FileResponse } from '@common/shared/fetchUtils';
import style from './FilePreview.module.css';

const iframeFiletype = ['application/pdf'];
const imageFiletype = ['image/png', 'image/jpeg', 'image/svg+xml'];

type Props = {
    name: string;
    file: FileResponse;
};

// One url per file, since a new src on a loaded iframe adds a history entry
const useBlobUrl = (file: FileResponse) => {
    const [blobURL, setBlobURL] = useState<string>();

    useEffect(() => {
        const url = URL.createObjectURL(new Blob([file.data], { type: file.mimeType }));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBlobURL(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return blobURL;
};

export const FilePreview = ({ name, file }: Props) => {
    const blobURL = useBlobUrl(file);
    if (!blobURL) return null;

    if (iframeFiletype.includes(file.mimeType)) {
        return <iframe key={blobURL} className={style.iframe} src={blobURL} title={name} />;
    }

    return (
        <>
            {imageFiletype.includes(file.mimeType) ? (
                <img className={style.image} alt="" src={blobURL} />
            ) : null}
            <div>
                <Link href={blobURL} target={'_blank'}>
                    {name} <DownloadIcon title="Last ned fil" />
                </Link>
            </div>
        </>
    );
};

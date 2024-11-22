import React from 'react';
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

export const FilePreview = ({ name, file }: Props) => {
    const blob = new Blob([file.data], { type: file.mimeType });
    const blobURL = URL.createObjectURL(blob);

    if (iframeFiletype.includes(file.mimeType)) {
        return <iframe className={style.iframe} src={blobURL} title={name} />;
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

import React from 'react';
import { Link } from '@navikt/ds-react';
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
        return <iframe className={style.iframe} src={blobURL} />;
    }

    if (imageFiletype.includes(file.mimeType)) {
        return <img className={style.image} alt="" src={blobURL} />;
    }

    return (
        <Link href={blobURL} target={'_blank'}>
            {name}
        </Link>
    );
};

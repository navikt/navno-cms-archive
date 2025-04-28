import React from 'react';
import { Loader } from '@navikt/ds-react';
import { useFetchAttachment } from 'client/hooks/useFetchAttachment';
import { FilePreview } from './FilePreview';
import { Content } from '../../../shared/types';

type Props = {
    content: Content;
};

export const FilePreviewWrapper = ({ content }: Props) => {
    const name = content.attachment?.name;
    const id = content._id;
    const versionId = content._versionKey;
    const locale = content.locale;

    const { data, isLoading } = useFetchAttachment({
        id,
        versionId,
        locale,
    });

    return (
        <>
            {isLoading ?? <Loader />}
            {data && <FilePreview name={name || ''} file={data} />}
        </>
    );
};

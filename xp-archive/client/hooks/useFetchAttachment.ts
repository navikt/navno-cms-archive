import { fetchFile, FileResponse } from '@common/shared/fetchUtils';
import useSWRImmutable from 'swr/immutable';

const ATTACHMENT_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/attachment`;

type FetchAttachmentParams = { id: string; locale: string; versionId: string };
type AttachmentKey = [url: string, params: FetchAttachmentParams];

const fetchAttachment = async ([url, params]: AttachmentKey) => {
    if (!params.id) return;
    return fetchFile(url, {
        params,
    });
};

export const useFetchAttachment = ({ id, locale, versionId }: FetchAttachmentParams) => {
    return useSWRImmutable<FileResponse | null | undefined, Error, AttachmentKey>(
        [ATTACHMENT_API, { id, locale, versionId }],
        fetchAttachment
    );
};

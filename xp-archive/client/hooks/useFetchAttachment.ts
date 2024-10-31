import { fetchFile } from '@common/shared/fetchUtils';
import useSWRImmutable from 'swr/immutable';

const ATTACHMENT_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/attachment`;

type FetchAttachmentParams = { id: string; locale: string; versionId: string };

const fetchAttachment = async (params: FetchAttachmentParams) => {
    if (!params.id) return;
    return fetchFile(ATTACHMENT_API, {
        params,
    });
};

export const useFetchAttachment = ({ id, locale, versionId }: FetchAttachmentParams) => {
    return useSWRImmutable({ id, locale, versionId }, fetchAttachment);
};

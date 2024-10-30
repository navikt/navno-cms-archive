import { fetchJson } from '@common/shared/fetchUtils';
import useSWRImmutable from 'swr/immutable';
import { ContentServiceResponse } from '../../shared/types';

const CONTENT_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/content`;

type FetchContentParams = { id: string; versionId?: string };

const fetchContent = async (params: FetchContentParams) => {
    if (!params.id) return;
    return fetchJson<ContentServiceResponse>(CONTENT_API, {
        params: { ...params, locale: 'no' },
    });
};

export const useFetchContent = ({ id, versionId }: FetchContentParams) => {
    return useSWRImmutable({ id, versionId }, fetchContent);
};

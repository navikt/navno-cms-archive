import { fetchJson } from '@common/shared/fetchUtils';
import useSWR, { useSWRConfig } from 'swr';
import { ContentServiceResponse } from '../../shared/types';

const CONTENT_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/content`;

type FetchContentParams = { id: string; locale: string; versionId?: string };

const fetchContent = async (params: FetchContentParams) => {
    if (!params.id) return;
    return fetchJson<ContentServiceResponse>(CONTENT_API, {
        params,
    });
};

export const useCacheContent = () => {
    const { mutate } = useSWRConfig();

    return (params: FetchContentParams, data: ContentServiceResponse) =>
        mutate({ id: params.id, locale: params.locale, versionId: params.versionId }, data, {
            revalidate: false,
        });
};

export const useFetchContent = ({ id, locale, versionId }: FetchContentParams) => {
    return useSWR({ id, locale, versionId }, fetchContent, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true,
        // Only revalidate when you want to
        revalidateOnMount: true,
    });
};

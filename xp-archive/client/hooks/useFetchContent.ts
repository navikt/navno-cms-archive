import { fetchJson } from '@common/shared/fetchUtils';
import { useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ContentServiceResponse } from '../../shared/types';

const CONTENT_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/content`;

type FetchContentParams = { id: string; locale: string; versionId?: string };
type ContentKey = [url: string, params: FetchContentParams];

const fetchContent = async ([url, params]: ContentKey) => {
    if (!params.id) return;
    return fetchJson<ContentServiceResponse>(url, {
        params,
    });
};

// The url keeps the key apart from attachments with the same params
const getContentKey = ({ id, locale, versionId }: FetchContentParams): ContentKey => [
    CONTENT_API,
    { id, locale, versionId },
];

export const useCacheContent = () => {
    const { mutate } = useSWRConfig();

    return useCallback(
        (params: FetchContentParams, data: ContentServiceResponse) =>
            mutate(getContentKey(params), data, { revalidate: false }),
        [mutate]
    );
};

export const useFetchContent = (params: FetchContentParams) => {
    return useSWR(getContentKey(params), fetchContent, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: false,
        keepPreviousData: true,
        // Only revalidate when you want to
        revalidateOnMount: true,
    });
};

import { fetchJson } from '@common/shared/fetchUtils';
import useSWRImmutable from 'swr/immutable';
import { ContentServiceResponse } from '../../shared/types';

const CONTENT_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/content`;

const fetchContent = async (id: string) => {
    return fetchJson<ContentServiceResponse>(CONTENT_API, { params: { id, locale: 'no' } });
};

export const useFetchContent = (id: string) => {
    return useSWRImmutable(id, fetchContent);
};

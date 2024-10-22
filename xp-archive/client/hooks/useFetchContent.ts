import { fetchJson } from '@common/shared/fetchJson';
import useSWRImmutable from 'swr/immutable';
import { Content } from '../../shared/types';

const CONTENT_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/content`;

const fetchContent = async (id: string) => {
    return fetchJson<Content>(CONTENT_API, { params: { id, locale: 'no' } });
};

export const useFetchContent = (id: string) => {
    return useSWRImmutable(id, fetchContent);
};

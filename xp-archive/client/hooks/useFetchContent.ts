import { fetchJson } from '@common/shared/fetchJson';
import useSWRImmutable from 'swr/immutable';
import { Content } from '../../shared/types';

const CONTENT_API = 'http://localhost:3499/xp/api/content';

const fetchContent = async (id: string) => {
    return fetchJson<Content>(CONTENT_API, { params: { id, locale: 'no' } });
};

export const useFetchContent = (id: string) => {
    return useSWRImmutable(id, fetchContent);
};

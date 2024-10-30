import { fetchJson } from '@common/shared/fetchUtils';
import useSWRImmutable from 'swr/immutable';
import { XPContentTreeServiceResponse } from '../../shared/types';

const CONTENT_TREE_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/contentTree`;

const fetchContentTree = async ({ path, locale }: { path: string; locale: string }) => {
    return fetchJson<XPContentTreeServiceResponse>(CONTENT_TREE_API, { params: { path, locale } });
};

export const useContentTree = (path: string, locale: string) => {
    return useSWRImmutable({ path, locale }, fetchContentTree);
};

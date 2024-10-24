import { fetchJson } from '@common/shared/fetchUtils';
import useSWRImmutable from 'swr/immutable';
import { XPContentTreeServiceResponse } from '../../shared/types';

const CONTENT_TREE_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/contentTree`;

const fetchContentTree = async (path: string) => {
    return fetchJson<XPContentTreeServiceResponse>(CONTENT_TREE_API, { params: { path } });
};

export const useContentTree = (path: string) => {
    return useSWRImmutable(path, fetchContentTree);
};

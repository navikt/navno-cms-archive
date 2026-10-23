import { fetchJson } from '@common/shared/fetchUtils';
import useSWRImmutable from 'swr/immutable';
import { XPContentTreeServiceResponse } from '../../shared/types';

// Serveren velger kilde (indeks eller XP live) ut fra READ_FROM_INDEX.
// Kjent åpent punkt: kun verifisert mot locale=no – ARCHIVE_ROOT_PREFIX i
// server/src/utils/paths.ts er ikke bekreftet for en/nn/se ennå.
const CONTENT_TREE_API = `${import.meta.env.VITE_APP_ORIGIN}/xp/api/contentTree`;

const fetchContentTree = async ({ path, locale }: { path: string; locale: string }) => {
    return fetchJson<XPContentTreeServiceResponse>(CONTENT_TREE_API, { params: { path, locale } });
};

export const useContentTree = (path: string, locale: string) => {
    return useSWRImmutable<XPContentTreeServiceResponse | null, Error>(
        { path, locale },
        fetchContentTree
    );
};

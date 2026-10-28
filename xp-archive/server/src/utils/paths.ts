// Avleder direkte-forelder-stien fra en STRIPPET/relativ sti (rot = '/', se
// stripArchiveRootPrefix), for å kunne spørre OpenSearch etter "direkte barn av X"
// (term-match på parentPath) uten å måtte gjøre dybde-bevisst prefix-matching på path.
// Rot-nivå (kun ett '/'-segment) får '/' som parentPath.
export const getParentPath = (path: string): string => {
    if (path === '/') {
        return '/';
    }
    const lastSlash = path.lastIndexOf('/');
    return lastSlash <= 0 ? '/' : path.slice(0, lastSlash);
};

// Siste sti-segment, brukt som visningsnavn på nodenivå i innholdstreet.
export const getPathName = (path: string): string => {
    const lastSlash = path.lastIndexOf('/');
    return lastSlash < 0 ? path : path.slice(lastSlash + 1);
};

// XP sitt rot-node-prefiks for nav.no-innhold. Klient-treet og XP sine egne
// externalArchive-tjenester (stripPathPrefix) opererer på relative stier med '/'
// som rot – arkivet lagret tidligere den fulle, rå XP-stien (f.eks.
// "/content/www.nav.no/aap"), som aldri matcher klientens '/'-forespørsel.
// Strippes ved indeksering slik at path/parentPath bruker samme konvensjon som
// resten av produktet.
// NB: verifisert mot ekte 'no'-locale-data; ikke bekreftet at andre locale-repoer
// bruker eksakt samme prefiks.
const ARCHIVE_ROOT_PREFIX = '/content/www.nav.no';

export const stripArchiveRootPrefix = (path: string): string => {
    if (path === ARCHIVE_ROOT_PREFIX) {
        return '/';
    }
    return path.startsWith(`${ARCHIVE_ROOT_PREFIX}/`)
        ? path.slice(ARCHIVE_ROOT_PREFIX.length)
        : path;
};

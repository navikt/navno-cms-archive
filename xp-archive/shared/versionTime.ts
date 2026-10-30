import { VersionReference } from './types';

// Når versjonen ble synlig på nav.no. Innhold som er planlagt publisert, lagres før publiseringstidspunktet, og da brukes publiseringstidspunktet. Ble versjonen lagret og publisert senere uten planlegging, brukes lagringstiden, som da er for tidlig
export const getVersionVisibleTime = ({ timestamp, publishFromTime }: VersionReference) => {
    if (publishFromTime && new Date(publishFromTime) > new Date(timestamp)) {
        return publishFromTime;
    }

    return timestamp;
};

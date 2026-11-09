import { VersionReference } from './types';

export const getVersionVisibleTime = ({ timestamp, publishFromTime }: VersionReference) => {
    // Planlagt innhold lagres før det blir synlig, så da brukes publiseringstidspunktet
    if (publishFromTime && new Date(publishFromTime) > new Date(timestamp)) {
        return publishFromTime;
    }

    // Ellers ble versjonen som regel publisert rett etter at den ble lagret
    return timestamp;
};

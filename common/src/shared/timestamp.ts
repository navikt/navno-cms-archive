export const formatTimestamp = (tsRaw: string) =>
    new Date(tsRaw).toLocaleString('no', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

export const formatTimestamp = (timestamp: string, excludeTime?: boolean) => {
    const date = new Date(timestamp);
    const dateString = date.toLocaleString('no', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    if (excludeTime) {
        return dateString;
    }

    const timeString = date
        .toLocaleString('no', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })
        .replace(':', '.');

    return `${dateString}, kl. ${timeString}`;
};

export const formatTimestampForPDF = (timestamp: string) => {
    const date = new Date(timestamp);
    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    const timeString = date.toLocaleString('no', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return `${dateString}-${timeString}`;
};

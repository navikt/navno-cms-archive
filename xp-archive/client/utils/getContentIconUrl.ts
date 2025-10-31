export const getContentIconUrl = (type: string) =>
    `${import.meta.env.VITE_APP_ORIGIN}/xp/api/contentIcon?type=${type}`;

export const fetchJson = async <ResponseType>(
    url: string,
    params?: Record<string, any>,
    retries = 1
): Promise<ResponseType | null> => {
    const paramsString = params
        ? new URLSearchParams(params as Record<string, string>).toString()
        : null;
    const urlWithParams = paramsString ? `${url}?${paramsString}` : url;

    try {
        const res = await fetch(urlWithParams);
        if (res.ok) {
            return res.json();
        }

        throw new Error(`${res.status} - ${res.statusText}`);
    } catch (e) {
        if (retries > 0) {
            console.log(`Failed to fetch from ${urlWithParams}, retrying`);
            return fetchJson(url, params, retries - 1);
        }

        console.error(`Failed to fetch json from ${url} - ${e}`);
        return null;
    }
};

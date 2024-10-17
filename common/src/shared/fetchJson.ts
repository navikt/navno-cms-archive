export const objectToQueryString = (params?: Record<string, unknown>) =>
    params
        ? Object.entries(params).reduce(
              (acc, [k, v], i) =>
                  v !== undefined
                      ? `${acc}${i ? '&' : '?'}${k}=${encodeURIComponent(
                            typeof v === 'object' ? JSON.stringify(v) : v.toString()
                        )}`
                      : acc,
              ''
          )
        : '';

export const fetchJson = async <ResponseType>(
    url: string,
    options: { params?: Record<string, unknown>; headers?: HeadersInit },
    retries = 1
): Promise<ResponseType | null> => {
    const { headers, params } = options;

    try {
        const res = await fetch(`${url}${objectToQueryString(params)}`, { headers });
        if (res.ok) {
            return res.json();
        }

        throw new Error(`${res.status} - ${res.statusText}`);
    } catch (e) {
        if (retries > 0) {
            console.log(`Failed to fetch from ${url}, retrying`);
            return fetchJson(url, options, retries - 1);
        }

        console.error(`Failed to fetch json from ${url} - ${e}`);
        return null;
    }
};

export const fetchJson = <ResponseType = any>(
    url: string,
    config?: Record<string, any>,
    retries = 0
): Promise<ResponseType | null> =>
    fetch(url, config)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }

            throw new Error(`${res.status} - ${res.statusText}`);
        })
        .catch((e) => {
            if (retries > 0) {
                console.log(`Failed to fetch from ${url}, retrying`);
                return fetchJson(url, config, retries - 1);
            }

            console.error(`Failed to fetch json from ${url} - ${e}`);
            return null;
        });

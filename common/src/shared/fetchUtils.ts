type Options = RequestInit & { params?: Record<string, unknown> };

const objectToQueryString = (params?: Record<string, unknown>) =>
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

const fetchWithRetry = async (
    url: string,
    options: Options = {},
    retries = 1
): Promise<Response> => {
    const { params, ...init } = options;

    const urlWithParams = `${url}${objectToQueryString(params)}`;

    try {
        const res = await fetch(urlWithParams, init);
        if (res.ok) {
            return res;
        }

        throw new Error(`${res.status} - ${res.statusText}`);
    } catch (e) {
        if (retries > 0) {
            console.log(`Failed to fetch from ${urlWithParams}, retrying`);
            return fetchWithRetry(url, options, retries - 1);
        }

        console.error(`Failed to fetch from ${urlWithParams} - ${e}`);
        throw e;
    }
};

export const fetchJson = async <ResponseType>(
    url: string,
    options?: Options
): Promise<ResponseType | null> =>
    fetchWithRetry(url, options)
        .then((res) => res.json() as ResponseType)
        .catch((e) => {
            console.error(`Failed to fetch json from ${url} - ${e}`);
            return null;
        });

export const fetchHtml = async (url: string, options?: Options): Promise<string | null> =>
    fetchWithRetry(url, options)
        .then((res) => res.text())
        .catch((e) => {
            console.error(`Failed to fetch html from ${url} - ${e}`);
            return null;
        });

export type FileResponse = {
    data: ArrayBuffer;
    mimeType: string;
};

export const fetchFile = async (url: string, options: Options): Promise<FileResponse | null> =>
    fetchWithRetry(url, options)
        .then(async (res) => {
            return {
                data: await res.arrayBuffer(),
                mimeType: res.headers.get('content-type') || 'application/octet-stream',
            };
        })
        .catch((e) => {
            console.error(`Failed to fetch file from ${url} - ${e}`);
            return null;
        });

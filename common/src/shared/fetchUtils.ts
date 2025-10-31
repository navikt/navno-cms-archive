type Options = RequestInit & { params?: Record<string, unknown> };

export const getErrorMessage = (e: unknown): string => {
    return e instanceof Error ? e.message : String(e);
};

const stringifyValue = (v: unknown): string => {
    if (typeof v === 'object' && v !== null) {
        return JSON.stringify(v);
    }
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        return String(v);
    }
    return String(v);
};

const objectToQueryString = (params?: Record<string, unknown>) =>
    params
        ? Object.entries(params).reduce((acc, [k, v], i) => {
              if (v === undefined) return acc;
              const stringValue = stringifyValue(v);
              return `${acc}${i ? '&' : '?'}${k}=${encodeURIComponent(stringValue)}`;
          }, '')
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

        console.error(`Failed to fetch from ${urlWithParams} - ${getErrorMessage(e)}`);
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
    contentDisposition: string | null;
};

export const fetchFile = async (url: string, options: Options): Promise<FileResponse | null> =>
    fetchWithRetry(url, options)
        .then(async (res) => {
            return {
                data: await res.arrayBuffer(),
                mimeType: res.headers.get('content-type') || 'application/octet-stream',
                contentDisposition: res.headers.get('content-disposition'),
            };
        })
        .catch((e) => {
            console.error(`Failed to fetch file from ${url} - ${e}`);
            return null;
        });

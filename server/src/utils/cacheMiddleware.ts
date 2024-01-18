import { LRUCache } from 'lru-cache';
import { RequestHandler } from 'express';

type CacheMiddlewareOptions = {
    cacheOnErrors?: boolean;
    ttlSec: number;
    maxSize: number;
};

type ResponseCacheEntry = {
    sentData: unknown;
    statusCode: number;
};

export const createCacheMiddleware = ({
    cacheOnErrors = false,
    ttlSec,
    maxSize,
}: CacheMiddlewareOptions): RequestHandler => {
    if (process.env.NODE_ENV === 'development') {
        return (req, res, next) => {
            next();
        };
    }

    const cache = new LRUCache<string | number, ResponseCacheEntry>({
        ttl: ttlSec * 1000,
        max: maxSize,
    });

    return (req, res, next) => {
        const { originalUrl } = req;

        const cachedRes = cache.get(originalUrl);
        if (cachedRes) {
            const { sentData, statusCode } = cachedRes;
            return res.status(statusCode).send(sentData);
        }

        const originalSend = res.send;

        res.send = (sentData) => {
            const { statusCode } = res;
            if (statusCode < 400 || cacheOnErrors) {
                cache.set(originalUrl, {
                    sentData,
                    statusCode,
                });
            }

            return originalSend.bind(res)(sentData);
        };

        next();
    };
};

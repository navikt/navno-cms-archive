import { RequestHandler } from 'express';
import { DATA, getCSP, SELF, UNSAFE_EVAL, UNSAFE_INLINE } from 'csp-header';

const HMR_HOST = 'localhost:24678';
const NAV_CDN_HOST = 'https://cdn.nav.no';

const csp = getCSP({
    directives: {
        'default-src': [SELF, DATA],
        'script-src': [SELF, UNSAFE_INLINE, UNSAFE_EVAL],
        'script-src-elem': [SELF, UNSAFE_INLINE],
        'style-src': [SELF, UNSAFE_INLINE],
        'style-src-elem': [SELF, UNSAFE_INLINE],
        'font-src': [SELF, DATA, NAV_CDN_HOST],
        'connect-src': [
            SELF,
            ...(process.env.NODE_ENV === 'development'
                ? [`ws://${HMR_HOST}`, `http://${HMR_HOST}`]
                : []),
        ],
    },
});

export const cspMiddleware: RequestHandler = (req, res, next) => {
    res.setHeader('Content-Security-Policy', csp);
    next();
};

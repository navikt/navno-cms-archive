import express, { Express, RequestHandler } from 'express';
import path from 'path';

const ASSETS_ROOT = path.join(process.cwd(), '..', 'cms-assets');
const ASSETS_ROOT_SBS = path.join(ASSETS_ROOT, 'sbs');
const ASSETS_ROOT_FSS = path.join(ASSETS_ROOT, 'fss');

const staticSbs = express.static(ASSETS_ROOT_SBS);
const staticFss = express.static(ASSETS_ROOT_FSS);

const staticReqHandlers: Record<string, RequestHandler> = {
    sbs: staticSbs,
    fss: staticFss,
} as const;

// Attempt to use the correct assets root depending on the referrer-header of the caller
// If the caller can not be determined from the referrer, we will look in both assets roots
// Normally, calls from an archive site will have either /sbs/* or /fss/* as referrer
// CSS urls are one exception from this, they will instead have the url of the CSS file as their referrer
const staticHandlerByReferrer: RequestHandler = (req, res, next) => {
    const referrer = req.get('Referrer');
    if (!referrer) {
        return next();
    }

    const cmsInstanceFromPath = new URL(referrer).pathname.split('/')[1];
    const reqHandler = staticReqHandlers[cmsInstanceFromPath];

    return reqHandler ? reqHandler(req, res, next) : next();
};

export const setupCmsAssetsRouting = (expressApp: Express) => {
    expressApp.use(
        '/:siteKey/_public',
        staticHandlerByReferrer,
        staticSbs,
        staticFss
    );
};

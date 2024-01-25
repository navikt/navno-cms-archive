import { Express, Request } from 'express';
import path from 'path';

const ASSETS_ROOT = path.join(process.cwd(), '..', 'cms-assets');
const ASSETS_ROOT_SBS = path.join(ASSETS_ROOT, 'sbs');
const ASSETS_ROOT_FSS = path.join(ASSETS_ROOT, 'fss');

const assetsRoots: Record<string, string> = {
    sbs: ASSETS_ROOT_SBS,
    fss: ASSETS_ROOT_FSS,
} as const;

const getAssetsRoot = (req: Request) => {
    const referrer = req.get('Referrer');
    if (!referrer) {
        return null;
    }

    const cmsInstance = new URL(referrer).pathname.split('/')[1];
    return assetsRoots[cmsInstance];
};

export const setupCmsAssetsRouting = (expressApp: Express) => {
    expressApp.use('/:siteKey/_public', (req, res, next) => {
        const assetsRoot = getAssetsRoot(req);
        if (!assetsRoot) {
            return next();
        }

        res.sendFile(path.join(assetsRoot, req.path));
    });
};

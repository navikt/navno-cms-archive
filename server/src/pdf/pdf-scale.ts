const PUPPETEER_PDF_DPI = 96;
const A4_INCH_WIDTH = 8.27;
const SCALE_FACTOR = PUPPETEER_PDF_DPI * A4_INCH_WIDTH;

const MIN = 0.1;
const MAX = 2;

export const pixelWidthToA4Scale = (pxWidth: number): number =>
    Math.max(MIN, Math.min(MAX, (1 / pxWidth) * SCALE_FACTOR));

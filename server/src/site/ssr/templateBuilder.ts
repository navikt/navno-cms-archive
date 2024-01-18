import path from 'path';
import fs from 'fs';

const templatePath =
    process.env.NODE_ENV === 'development'
        ? path.resolve(process.cwd(), '..', 'index.html')
        : path.resolve(process.cwd(), 'dist', 'client', 'index.html');

export const buildHtmlTemplate = () => {
    return fs.readFileSync(templatePath, { encoding: 'utf-8' });
};

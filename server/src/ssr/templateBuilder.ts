import path from 'path';
import fs from 'fs';

export const buildHtmlTemplate = () => {
    const templatePath =
        process.env.NODE_ENV === 'development'
            ? path.resolve(process.cwd(), '..', 'index.html')
            : path.resolve(process.cwd(), 'dist', 'client', 'index.html');

    return fs.readFileSync(templatePath, { encoding: 'utf-8' });
};

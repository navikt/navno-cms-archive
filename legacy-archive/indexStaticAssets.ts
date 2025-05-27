import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

import { Client } from '@opensearch-project/opensearch';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'node:crypto';

type AssetDocument = {
    path: string;
    dirname: string;
    filename: string;
    filesize: number;
    modifiedTime: string;
    data: string;
};

type CmsInstance = 'fss' | 'sbs';

const { OPEN_SEARCH_URI, OPEN_SEARCH_USERNAME, OPEN_SEARCH_PASSWORD } = process.env;

const client = new Client({
    node: OPEN_SEARCH_URI,
    auth: {
        username: OPEN_SEARCH_USERNAME as string,
        password: OPEN_SEARCH_PASSWORD as string,
    },
});

const createIndex = async (instance: CmsInstance) => {
    const indexName = `cms${instance}_assets`;

    const indexExists = await client.indices.exists({ index: indexName }).then((res) => res.body);

    if (indexExists) {
        console.log(`Index ${indexName} already exists`);
        return indexName;
    }

    const indexCreated = await client.indices
        .create({
            index: indexName,
            body: {
                mappings: {
                    properties: {
                        path: {
                            type: 'keyword',
                        },
                        dirname: {
                            type: 'text',
                        },
                        filename: {
                            type: 'text',
                        },
                        filesize: {
                            type: 'integer',
                        },
                        modifiedTime: {
                            type: 'date',
                        },
                        data: {
                            type: 'binary',
                        },
                    },
                },
            },
        })
        .then((res) => res.body);

    console.log(`Index created result: `, indexCreated);
    if (!indexCreated.acknowledged) {
        throw Error();
    }

    return indexCreated.index;
};

const enumerateFiles = (systemBaseDir: string, dirname: string): string[] => {
    const currentBaseDir = path.join(systemBaseDir, dirname);
    const files: string[] = [];

    fs.readdirSync(currentBaseDir).forEach((fileName) => {
        const fullName = path.join(dirname, fileName);
        const lstat = fs.lstatSync(path.join(systemBaseDir, fullName));

        if (lstat.isDirectory()) {
            files.push(...enumerateFiles(systemBaseDir, fullName));
        } else if (lstat.isFile()) {
            files.push(fullName);
        } else {
            console.log('Unexpected lstat result', lstat);
        }
    });

    return files;
};

const indexFile = async (indexName: string, baseDir: string, filePath: string) => {
    const fullPath = path.join(baseDir, filePath);
    const fileData = fs.readFileSync(fullPath);
    const fileStats = fs.lstatSync(fullPath);

    const assetDocument: AssetDocument = {
        path: filePath,
        dirname: path.dirname(filePath),
        filename: path.basename(filePath),
        filesize: fileStats.size,
        modifiedTime: fileStats.mtime.toISOString(),
        data: fileData.toString('base64'),
    };

    return client
        .index({
            index: indexName,
            id: randomUUID({ disableEntropyCache: true }),
            body: assetDocument,
        })
        .then((res) => {
            if (res.statusCode && res.statusCode >= 400) {
                console.error(`Error indexing ${filePath}`, res);
            }
        });
};

const instance: CmsInstance = 'sbs';

createIndex(instance).then((indexName: string) => {
    const baseDir = path.join(process.cwd(), 'cms-assets', instance);
    const files = enumerateFiles(baseDir, '').map((file) =>
        file.split(path.sep).join(path.posix.sep)
    );
    console.log(`Found ${files.length} files in directory ${baseDir}`);

    files.forEach(async (file) => await indexFile(indexName, baseDir, file));
});

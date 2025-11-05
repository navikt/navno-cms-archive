import process from 'process';

export const validateEnv = (expectedVars: readonly string[] | string[]) => {
    const missingVars: string[] = [];

    expectedVars.forEach((key) => {
        if (!process.env[key]) {
            console.error(`Missing env var for ${key}!`);
            missingVars.push(key);
        }
    });

    if (missingVars.length > 0) {
        throw new Error('Missing critical env vars!');
    }
};

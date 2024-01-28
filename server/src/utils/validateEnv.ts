import * as process from 'process';

const EXPECTED_KEYS: Array<keyof NodeJS.ProcessEnv> = [
    'NODE_ENV',
    'APP_PORT',
    'APP_BASEPATH',
    'OPEN_SEARCH_URI',
    'OPEN_SEARCH_USERNAME',
    'OPEN_SEARCH_PASSWORD',
];

export const validateEnv = async () => {
    const isValid = EXPECTED_KEYS.every((key) => {
        if (process.env[key]) {
            return true;
        }

        console.error(`Missing env var for ${key}!`);
        return false;
    });

    if (!isValid) {
        throw new Error('Missing critical env vars!');
    }
};

import process from 'process';

export const validateEnv = async (expectedVars: string[]) => {
    const isValid = expectedVars.every((key) => {
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

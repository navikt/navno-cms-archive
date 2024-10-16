declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            APP_BASEPATH: string;
            APP_PORT: string;
            APP_ORIGIN: string;
        }
    }
}

export {};

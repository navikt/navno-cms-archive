declare global {
    namespace NodeJS {
        interface ProcessEnv {
            VITE_APP_BASEPATH: string;
            VITE_APP_ORIGIN: string;
            APP_PORT: string;
            NODE_ENV: 'development' | 'production';
        }
    }
}

export {};

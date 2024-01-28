declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            APP_BASEPATH: string;
            APP_PORT: string;
            OPEN_SEARCH_URI: string;
            OPEN_SEARCH_USERNAME: string;
            OPEN_SEARCH_PASSWORD: string;
        }
    }
}

export {};

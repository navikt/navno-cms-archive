import { createHttpTerminator } from 'http-terminator';
import { Express } from 'express';
import { validateEnv } from './utils/validateEnv';
import { getErrorMessage } from '../shared/fetchUtils';

type Props = {
    envKeys: string[] | readonly string[];
    port: number;
    initApp: () => Promise<Express>;
};

export const startServer = ({ envKeys, port, initApp }: Props) => {
    validateEnv(envKeys);

    void initApp()
        .catch((e) => {
            console.error(`Error occurred while initializing server - ${getErrorMessage(e)}`);
            throw e;
        })
        .then((app) => {
            const server = app.listen(port, () => {
                console.log(`Server starting on port ${port}`);
            });

            const httpTerminator = createHttpTerminator({ server });

            const shutdown = (signal: string) => {
                console.log(`Received ${signal} - Server shutting down`);
                void httpTerminator.terminate().then(() => {
                    server.close(() => {
                        console.log('Shutdown complete!');
                        process.exit(0);
                    });
                });
            };

            process.on('SIGTERM', shutdown);
            process.on('SIGINT', shutdown);
        });
};

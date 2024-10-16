import { createHttpTerminator } from 'http-terminator';
import { Express } from 'express';
import { validateEnv } from './utils/validateEnv';

type Props = {
    envKeys: string[] | readonly string[];
    port: number;
    initApp: () => Promise<Express>;
};

export const startServer = ({ envKeys, port, initApp }: Props) => {
    validateEnv(envKeys)
        .then(initApp)
        .catch((e) => {
            console.error(`Error occured while initializing server - ${e}`);
            throw e;
        })
        .then((app) => {
            const server = app.listen(port, () => {
                console.log(`Server starting on port ${port}`);
            });

            const httpTerminator = createHttpTerminator({ server });

            const shutdown = () => {
                console.log('Server shutting down');
                httpTerminator.terminate().then(() => {
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

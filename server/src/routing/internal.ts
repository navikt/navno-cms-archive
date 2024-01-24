import { Express } from 'express';

export const setupInternalRoutes = (expressApp: Express) => {
    expressApp.get('/internal/isAlive', (_, res) => res.status(200).json({ message: 'I am alive!' }));
    expressApp.get('/internal/isReady', (_, res) => res.status(200).json({ message: 'I am ready!' }));
};

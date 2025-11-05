import { Router } from 'express';

export const setupNaisProbeHandlers = (router: Router) => {
    router.get('/internal/isAlive', (_, res) => {
        res.status(200).json({ message: 'I am alive!' });
    });
    router.get('/internal/isReady', (_, res) => {
        res.status(200).json({ message: 'I am ready!' });
    });
};

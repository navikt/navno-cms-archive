import { RequestHandler } from 'express';

export const isReadyHandler: RequestHandler = (req, res) => {
    return res.status(200).json({ message: 'I am ready!' });
};

import { ErrorRequestHandler, Express, RequestHandler } from 'express';

export const setupErrorHandlers = (expressApp: Express) => {
    const notFoundHandler: RequestHandler = (req, res, _) => {
        res.status(404).send('Not found');
    };

    const serverErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
        const { path } = req;
        const { status, stack } = err;
        const msg = stack?.split('\n')[0];
        const statusCode = status || 500;

        if (statusCode < 500) {
            console.log(`Invalid request to ${path}: ${statusCode} ${msg}`);
            return notFoundHandler(req, res, next);
        }

        console.error(`Server error on ${path}: ${statusCode} ${msg}`);

        return res.status(statusCode).end();
    };

    expressApp.use('*', notFoundHandler);

    expressApp.use(serverErrorHandler);
};

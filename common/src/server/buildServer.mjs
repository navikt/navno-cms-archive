import { build, context } from 'esbuild';

export const buildServer = async (options) => {
    if (process.env.WATCH === 'true') {
        console.log('Building in watch mode');

        const stop = async (signal) => {
            console.log(`Received ${signal} - Aborting build/watch`);
            await ctx.dispose();
        };

        process.on('SIGTERM', stop);
        process.on('SIGINT', stop);

        const ctx = await context(options);
        await ctx.watch();
    } else {
        console.log('Building in production mode');
        await build(options);
    }
};

import { build, context } from 'esbuild';

const isWatchMode = process.env.WATCH === 'true';

const options = {
    entryPoints: ['src/server.ts'],
    outfile: 'dist/server/server.cjs',
    bundle: true,
    platform: 'node',
    packages: 'external',
};

if (isWatchMode) {
    console.log('Building in watch mode');
    const stopWatch = new Promise(() => {});

    const kill = async (signal) => {
        console.log(`Received ${signal} - Aborting build/watch`);
        await Promise.all([ctx.dispose(), Promise.resolve(stopWatch)]);
    };

    process.on('SIGTERM', kill);
    process.on('SIGINT', kill);

    const ctx = await context(options);

    await Promise.all([ctx.watch(), stopWatch]);
} else {
    console.log('Building in production mode');
    await build(options);
}

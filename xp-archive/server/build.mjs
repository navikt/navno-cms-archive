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
    await context(options).then((buildContext) => buildContext.watch());
} else {
    console.log('Building in production mode');
    await build(options);
}

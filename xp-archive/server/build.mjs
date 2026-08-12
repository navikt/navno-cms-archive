import { buildServer } from 'navno-cms-archive-common/src/server/buildServer.mjs';

await buildServer({
    entryPoints: ['src/server.ts'],
    outfile: 'dist/server/server.cjs',
    bundle: true,
    platform: 'node',
    packages: 'external',
});

await buildServer({
    entryPoints: ['src/backfillJob.ts'],
    outfile: 'dist/server/backfillJob.cjs',
    bundle: true,
    platform: 'node',
    packages: 'external',
});

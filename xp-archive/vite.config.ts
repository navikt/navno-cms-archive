import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import visualizer from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        plugins: [
            react(),
            tsconfigPaths(),
            ...(process.env.ANALYZE
                ? [visualizer({ gzipSize: true, open: true, sourcemap: true })]
                : []),
        ],
        base: '/xp',
        ssr: {
            // Externalizing certain libraries causes SSR crashes due to invalid imports in the SSR bundle
            noExternal: [
                '@babel/runtime',
                '@navikt/aksel-icons',
                '@navikt/ds-react',
                /@radix-ui\/.*/,
                'lodash',
                'react-xml-viewer',
                'swr',
            ],
        },
        css: {
            modules: {
                generateScopedName: '[name]_[local]_[hash:base64:5]',
            },
        },
    };
});

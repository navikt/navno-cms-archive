import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import visualizer from 'rollup-plugin-visualizer';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';

    return {
        plugins: [
            react(),
            tsconfigPaths(),
            ...(process.env.ANALYZE
                ? [visualizer({ gzipSize: true, open: true, sourcemap: true })]
                : []),
        ],
        ssr: {
            // Externalizing certain libraries seems to cause crashes due to invalid imports in the SSR bundle
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
    };
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import visualizer from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';

    return {
        plugins: [
            react(),
            ...(process.env.ANALYZE
                ? [visualizer({ gzipSize: true, open: true, sourcemap: true })]
                : []),
        ],
        ssr: {
            // Externalizing certain libraries seems to crash SSR in dev mode due to invalid imports
            noExternal: [
                '@navikt/ds-react',
                '@navikt/aksel-icons',
                /@radix-ui\/.*/,
                'react-xml-viewer',
            ],
        },
    };
});

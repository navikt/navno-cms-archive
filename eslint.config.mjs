import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import cssModules from 'eslint-plugin-css-modules';
import globals from 'globals';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/_ssr-dist/**',
            '**/public/**',
            '**/.cache/**',
            '**/*.cjs',
            '**/*.mjs',
        ],
    },
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser,
                ...globals.es2022,
                RequestInit: 'readonly',
                React: 'readonly',
            },
        },
        plugins: {
            react: react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'css-modules': cssModules,
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...cssModules.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/require-await': 'warn',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        files: ['**/server/**/*.{ts,tsx}', '**/vite.config.ts', '**/puppeteer.config.cjs', '**/indexStaticAssets.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    }
];

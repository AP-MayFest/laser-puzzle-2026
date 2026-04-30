import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.strict,
            tseslint.configs.stylisticTypeChecked,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        rules: {
            'semi': ['error', 'always'],
            'semi-spacing': 'error',
            'semi-style': ['error', 'last'],
            'quotes': ['error', 'single'],
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            "no-empty-function": "off",
            "@typescript-eslint/no-empty-function": "off",
            'react-refresh/only-export-components': [
                'error',
                { allowConstantExport: true },
            ],
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                projectService: true,
            },
        },
    },
])
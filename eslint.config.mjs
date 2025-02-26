import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jest from 'eslint-plugin-jest';
import prettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
    {
        name: 'source',
        files: ['./src/**'],
        extends: [eslint.configs.recommended, tseslint.configs.recommended],
        ignores: ['dist'],
        rules: {
            'prettier/prettier': [
                'warn',
                {
                    printWidth: 120,
                    singleQuote: true,
                    trailingComma: 'all',
                    bracketSpacing: false,
                    tabWidth: 4,
                    bracketSameLine: false,
                },
            ],
        },
    },
    {
        name: 'tests',
        files: ['**/*.test.ts'],
        plugins: {
            jest,
        },
        languageOptions: {
            globals: jest.environments.globals.globals,
        },
        rules: {
            'jest/no-disabled-tests': 'warn',
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error',
            'jest/prefer-to-have-length': 'warn',
            'jest/valid-expect': 'error',
        },
    },
    {
        extends: [prettier /** use prettier.config.mjs for reassign rules */],
        ignores: ['dist'],
    },
);

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jest from 'eslint-plugin-jest';

export default tseslint.config(
    {
        name: 'source',
        files: ['./src/*'],
        extends: [eslint.configs.recommended, tseslint.configs.recommended],
    },
    {
        name: 'tests',
        files: ['**/*.test.ts'],
        languageOptions: {
            parser: tseslint.parser,
        },
        plugins: {
            jest,
        },
        rules: {
            'jest/no-disabled-tests': 'warn',
            'jest/no-identical-title': 'error',
            'jest/valid-expect': 'error',
        },
    },
    {
        ignores: ['dist/*', 'src/coverage/*'],
    },
);

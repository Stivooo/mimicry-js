/* global module */
/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+.ts$': ['ts-jest', {}],
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
    fakeTimers: {
        enableGlobally: true,
    },
    rootDir: 'src',
};

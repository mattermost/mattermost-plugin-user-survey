// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Config} from 'jest';

const config: Config = {
    preset: 'ts-jest',
    snapshotSerializers: [
        '<rootDir>/node_modules/enzyme-to-json/serializer',
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/non_npm_dependencies/',
    ],
    clearMocks: true,
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
    ],
    coverageReporters: [
        'lcov',
        'text-summary',
    ],
    moduleNameMapper: {
        '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'identity-obj-proxy',
        '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
        '^.*i18n.*\\.(json)$': '<rootDir>/tests/i18n_mock.json',
        '^bundle-loader\\?lazy\\!(.*)$': '$1',
        '^reselect': '<rootDir>/node_modules/mattermost-webapp/packages/reselect/src',
        '^mattermost-redux(.*)$': '<rootDir>/node_modules/mattermost-webapp/packages/mattermost-redux/src$1',
        '^@mattermost/(types)/(.*)$': '<rootDir>/node_modules/mattermost-webapp/packages/$1/src/$2',
        '^@mattermost/(client)$': '<rootDir>/node_modules/mattermost-webapp/packages/$1/src',
        '^@mattermost/(components)$': '<rootDir>/node_modules/mattermost-webapp/packages/$1/src',
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    moduleDirectories: [
        '<rootDir>',
        'node_modules',
        'non_npm_dependencies',
    ],
    reporters: [
        'default',
        'jest-junit',
    ],
    transformIgnorePatterns: [
        'node_modules/(?!react-native|react-router|mattermost-webapp)',
    ],
    setupFiles: [
        'jest-canvas-mock',
    ],
    setupFilesAfterEnv: [
        '<rootDir>/tests/setup.tsx',
    ],
    testEnvironment: 'jsdom',
};

export default config;

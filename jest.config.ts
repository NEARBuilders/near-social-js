import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

// config
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/',
    }),
  },
  preset: 'ts-jest',
  rootDir: './',
  setupFiles: ['<rootDir>/test/setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
      },
    ],
  },
  verbose: true,
};

export default config;

import eslint from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import eslintPrettier from 'eslint-config-prettier';
import globals from 'globals';
import eslintTypescript from 'typescript-eslint';

export default eslintTypescript.config(
  {
    ignores: [
      '.docusaurus/*',
      '.docs/*',
      'coverage/*',
      'dist/*',
      'docusaurus.config.js',
      'node_modules/*',
    ],
  },
  eslint.configs.recommended,
  ...eslintTypescript.configs.recommended,
  eslintPrettier,
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: typescriptParser,
    },
    rules: {
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      'prefer-const': 'off',
    },
  },
);

// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'perf/results/', '.auth/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Page objects expose assertion helpers named expect*(), e.g. expectLoaded().
      'playwright/expect-expect': [
        'error',
        { assertFunctionPatterns: ['^expect', '\\.expect[A-Z]'] },
      ],
      // Conditional skips (e.g. opt-in visual tests) are intentional.
      'playwright/no-skipped-test': ['error', { allowConditional: true }],
    },
  },
  {
    // k6 scripts run in the k6 (goja/sobek) runtime, not Node.
    files: ['perf/**/*.js', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      sourceType: 'module',
      globals: { ...globals.es2021, __ENV: 'readonly', __VU: 'readonly', __ITER: 'readonly' },
    },
  },
  prettier,
);

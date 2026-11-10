import { defineConfig, devices } from '@playwright/test';
import { env, STORAGE_STATE } from './src/utils/env';

const { isCI } = env;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    testIdAttribute: 'data-test',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: env.apiBaseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: env.uiBaseUrl },
    },
    ...(
      [
        ['ui-chromium', devices['Desktop Chrome']],
        ['ui-firefox', devices['Desktop Firefox']],
        ['ui-webkit', devices['Desktop Safari']],
      ] as const
    ).map(([name, device]) => ({
      name,
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...device, baseURL: env.uiBaseUrl, storageState: STORAGE_STATE },
    })),
  ],
});

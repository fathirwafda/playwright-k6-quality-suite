import { expect, loggedOutState, test } from '../../src/fixtures/ui';
import { env } from '../../src/utils/env';

/**
 * Visual snapshots are opt-in (VISUAL=1). Font rendering differs between
 * macOS, Linux and Windows, so baselines are only meaningful when generated
 * and compared on the same OS image (e.g. inside the Playwright Docker image
 * in CI). Create baselines with:
 *   VISUAL=1 npx playwright test visual --project=ui-chromium --update-snapshots
 */
test.describe('Visual @ui @visual', () => {
  test.skip(!env.visual, 'Visual snapshots are opt-in: set VISUAL=1 (see file header).');

  test.describe('logged out', () => {
    test.use(loggedOutState);

    test('login page matches snapshot', async ({ page, loginPage }) => {
      await loginPage.goto();
      await expect(page).toHaveScreenshot('login.png', { maxDiffPixelRatio: 0.01 });
    });
  });

  test('inventory page matches snapshot', async ({ page, inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();
    await expect(page).toHaveScreenshot('inventory.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

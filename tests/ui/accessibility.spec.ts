import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { expect, loggedOutState, test } from '../../src/fixtures/ui';
import { a11yBaseline, BLOCKING_IMPACTS } from '../../src/data/a11yBaseline';

async function scan(page: Page, testInfo: TestInfo) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();

  await testInfo.attach('axe-results.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  // Report every violation, whatever the impact, in the test output.
  for (const v of results.violations) {
    testInfo.annotations.push({
      type: `a11y:${v.impact ?? 'unknown'}`,
      description: `${v.id} (${v.nodes.length} nodes): ${v.help}`,
    });
  }
  return results.violations;
}

function blockingNotInBaseline(
  violations: Awaited<ReturnType<typeof scan>>,
  baseline: readonly string[],
): string[] {
  return violations
    .filter((v) => (BLOCKING_IMPACTS as readonly string[]).includes(v.impact ?? ''))
    .map((v) => v.id)
    .filter((id) => !baseline.includes(id));
}

test.describe('Accessibility @ui @a11y', () => {
  test.describe('logged out', () => {
    test.use(loggedOutState);

    test('login page has no new critical/serious violations', async ({ page, loginPage }, info) => {
      await loginPage.goto();
      await expect(loginPage.loginButton).toBeVisible();
      const violations = await scan(page, info);
      expect(blockingNotInBaseline(violations, a11yBaseline.login)).toEqual([]);
    });
  });

  test('inventory page has no new critical/serious violations', async ({
    page,
    inventoryPage,
  }, info) => {
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();
    const violations = await scan(page, info);
    expect(blockingNotInBaseline(violations, a11yBaseline.inventory)).toEqual([]);
  });
});

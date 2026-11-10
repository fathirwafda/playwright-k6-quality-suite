import { expect, test } from '../../src/fixtures/ui';
import { users } from '../../src/data/users';

/**
 * Known defects on the demo site. Each test asserts the CORRECT behaviour and
 * is marked with test.fail(): it passes while the bug exists and turns red
 * ("expected to fail but passed") the day the bug is fixed, so the note is
 * never silently stale.
 */
test.describe('Known issues @ui @regression @known-issue', () => {
  test('problem_user: every product shows a distinct image', async ({ loginAs }) => {
    test.info().annotations.push({
      type: 'known-issue',
      description:
        'problem_user gets the same placeholder image (sl-404) for every product on the inventory page.',
    });
    test.fail();

    const inventory = await loginAs(users.problem);
    const sources = await inventory.imageSources();

    expect(new Set(sources).size, `image sources: ${sources.join(', ')}`).toBe(sources.length);
  });

  test('control: standard_user shows a distinct image per product', async ({ loginAs }) => {
    const inventory = await loginAs(users.standard);
    const sources = await inventory.imageSources();
    expect(new Set(sources).size).toBe(sources.length);
    expect(sources.some((s) => s.includes('404'))).toBe(false);
  });
});

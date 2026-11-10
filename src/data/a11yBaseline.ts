/**
 * Accessibility baseline for the third-party demo site.
 *
 * We do not own Sauce Demo, so we cannot fix its violations. Instead the a11y
 * tests fail on any critical/serious axe violation that is NOT listed here.
 * That way the suite catches regressions while documenting known debt.
 * Each entry was observed with @axe-core/playwright against the live site.
 *
 * Last observed (Chromium, WCAG 2.1 A/AA + best-practice): no critical or
 * serious violations on either page, so both lists are empty. Moderate
 * findings are reported as annotations but do not fail the test:
 *   - login:     page-has-heading-one, region
 *   - inventory: page-has-heading-one
 */
export const a11yBaseline: Record<'login' | 'inventory', readonly string[]> = {
  login: [],
  inventory: [],
};

export const BLOCKING_IMPACTS = ['critical', 'serious'] as const;

/**
 * Sauce Demo users. These are public demo accounts printed on the
 * https://www.saucedemo.com login page; they are not secrets.
 */
export const SAUCE_PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: process.env.SAUCE_USERNAME ?? 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  performanceGlitch: 'performance_glitch_user',
} as const;

export type SauceUser = (typeof users)[keyof typeof users];

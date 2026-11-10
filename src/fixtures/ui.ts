import { test as base } from '@playwright/test';
import { CartPage, CheckoutPage, InventoryPage, LoginPage } from '../pages';
import { SAUCE_PASSWORD, type SauceUser } from '../data/users';

interface UiFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** Logs in as a specific user from a clean session (ignores storageState). */
  loginAs: (user: SauceUser) => Promise<InventoryPage>;
}

export const test = base.extend<UiFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  loginAs: async ({ page, context }, use) => {
    await use(async (user) => {
      await context.clearCookies();
      const login = new LoginPage(page);
      await login.goto();
      await login.login(user, SAUCE_PASSWORD);
      const inventory = new InventoryPage(page);
      await inventory.expectLoaded();
      return inventory;
    });
  },
});

/** Use in specs that must start logged out (login tests). */
export const loggedOutState = { storageState: { cookies: [], origins: [] } };

export { expect } from '@playwright/test';

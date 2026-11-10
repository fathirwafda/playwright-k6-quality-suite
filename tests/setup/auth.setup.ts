import { test as setup } from '@playwright/test';
import { STORAGE_STATE } from '../../src/utils/env';
import { InventoryPage, LoginPage } from '../../src/pages';
import { SAUCE_PASSWORD, users } from '../../src/data/users';

setup('authenticate standard_user', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(users.standard, SAUCE_PASSWORD);
  await new InventoryPage(page).expectLoaded();
  await page.context().storageState({ path: STORAGE_STATE });
});

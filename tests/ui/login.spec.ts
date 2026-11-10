import { expect, loggedOutState, test } from '../../src/fixtures/ui';
import { SAUCE_PASSWORD, users } from '../../src/data/users';

test.use(loggedOutState);

test.describe('Login @ui', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user logs in and lands on inventory @smoke', async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(users.standard, SAUCE_PASSWORD);
    await inventoryPage.expectLoaded();
  });

  test('user can log out and protected pages redirect to login @regression', async ({
    page,
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(users.standard, SAUCE_PASSWORD);
    await inventoryPage.expectLoaded();
    await inventoryPage.header.logout();
    await expect(loginPage.loginButton).toBeVisible();

    await page.goto('/inventory.html');
    await loginPage.expectError("You can only access '/inventory.html' when you are logged in.");
  });

  const negativeCases = [
    {
      name: 'locked out user is rejected',
      username: users.lockedOut,
      password: SAUCE_PASSWORD,
      error: 'Sorry, this user has been locked out.',
    },
    {
      name: 'wrong password is rejected',
      username: users.standard,
      password: 'not_the_password',
      error: 'Username and password do not match any user in this service',
    },
    {
      name: 'empty username is rejected',
      username: '',
      password: SAUCE_PASSWORD,
      error: 'Username is required',
    },
    {
      name: 'empty password is rejected',
      username: users.standard,
      password: '',
      error: 'Password is required',
    },
  ];

  for (const c of negativeCases) {
    test(`${c.name} @regression`, async ({ page, loginPage }) => {
      await loginPage.login(c.username, c.password);
      await loginPage.expectError(c.error);
      await expect(page).toHaveURL(/saucedemo\.com\/?$/);
    });
  }
});

import { faker } from '@faker-js/faker';
import { expect, test } from '../../src/fixtures/ui';
import { products } from '../../src/data/products';

const customer = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  postalCode: faker.location.zipCode(),
});

test.describe('Checkout @ui', () => {
  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack, products.boltTShirt);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
  });

  test('completes a full purchase with correct totals @smoke', async ({
    checkoutPage,
    inventoryPage,
  }) => {
    await checkoutPage.fillInformation(customer());
    await checkoutPage.expectOverview();
    await expect(checkoutPage.itemNames).toHaveText([products.backpack, products.boltTShirt]);

    const { subtotal, tax, total, itemSum } = await checkoutPage.totals();
    expect(subtotal).toBeCloseTo(itemSum, 2);
    expect(total).toBeCloseTo(subtotal + tax, 2);
    expect(tax).toBeGreaterThan(0);

    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await inventoryPage.header.expectCartCount(0);
  });

  const validation = [
    {
      field: 'first name',
      info: { lastName: 'Doe', postalCode: '12345' },
      error: 'First Name is required',
    },
    {
      field: 'last name',
      info: { firstName: 'Jane', postalCode: '12345' },
      error: 'Last Name is required',
    },
    {
      field: 'postal code',
      info: { firstName: 'Jane', lastName: 'Doe' },
      error: 'Postal Code is required',
    },
  ];

  for (const v of validation) {
    test(`requires ${v.field} @regression`, async ({ page, checkoutPage }) => {
      await checkoutPage.fillInformation(v.info);
      await expect(checkoutPage.error).toContainText(`Error: ${v.error}`);
      await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    });
  }

  test('cancel on the overview returns to inventory and keeps the cart @regression', async ({
    page,
    checkoutPage,
    inventoryPage,
  }) => {
    await checkoutPage.fillInformation(customer());
    await checkoutPage.expectOverview();
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL(/\/inventory\.html$/);
    await inventoryPage.header.expectCartCount(2);
  });
});

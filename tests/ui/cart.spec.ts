import { test } from '../../src/fixtures/ui';
import { products } from '../../src/data/products';

test.describe('Cart @ui', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();
  });

  test('adds a product and shows it in the cart @smoke', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.header.expectCartCount(1);

    await inventoryPage.header.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItems([products.backpack]);
  });

  test('adds several products and removes one from inventory @regression', async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addToCart(products.backpack, products.bikeLight, products.onesie);
    await inventoryPage.header.expectCartCount(3);

    await inventoryPage.removeFromCart(products.bikeLight);
    await inventoryPage.header.expectCartCount(2);

    await inventoryPage.header.openCart();
    await cartPage.expectItems([products.backpack, products.onesie]);
  });

  test('cart contents survive a page reload @regression', async ({ page, inventoryPage }) => {
    await inventoryPage.addToCart(products.fleeceJacket);
    await page.reload();
    await inventoryPage.header.expectCartCount(1);
  });

  test('removing the last item clears the badge @regression', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.boltTShirt);
    await inventoryPage.removeFromCart(products.boltTShirt);
    await inventoryPage.header.expectCartCount(0);
  });
});

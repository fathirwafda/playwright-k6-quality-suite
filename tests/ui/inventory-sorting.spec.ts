import { expect, test } from '../../src/fixtures/ui';
import { PRODUCT_COUNT } from '../../src/data/products';
import { sortedNumbers, sortedStrings } from '../../src/utils/sorting';

test.describe('Inventory sorting @ui @regression', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();
  });

  test('shows the full catalogue sorted by name A-Z by default @smoke', async ({
    inventoryPage,
  }) => {
    await expect(inventoryPage.items).toHaveCount(PRODUCT_COUNT);
    await expect(inventoryPage.sortSelect).toHaveValue('az');
    const names = await inventoryPage.names();
    expect(names).toEqual(sortedStrings(names, 'asc'));
  });

  test('sorts by name Z-A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.names();
    expect(names).toEqual(sortedStrings(names, 'desc'));
  });

  test('sorts by price low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.prices();
    expect(prices).toEqual(sortedNumbers(prices, 'asc'));
  });

  test('sorts by price high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.prices();
    expect(prices).toEqual(sortedNumbers(prices, 'desc'));
  });
});

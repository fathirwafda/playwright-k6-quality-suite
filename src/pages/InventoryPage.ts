import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './HeaderComponent';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  readonly header: HeaderComponent;
  readonly sortSelect: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemImages: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.sortSelect = page.getByTestId('product-sort-container');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.itemImages = page.locator('.inventory_item_img img');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
    await expect(this.title).toHaveText('Products');
    await expect(this.items.first()).toBeVisible();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async names(): Promise<string[]> {
    return this.itemNames.allInnerTexts();
  }

  async prices(): Promise<number[]> {
    const raw = await this.itemPrices.allInnerTexts();
    return raw.map((p) => Number(p.replace('$', '')));
  }

  /** Product slug as used in data-test ids, e.g. "Sauce Labs Backpack" -> "sauce-labs-backpack". */
  static slug(productName: string): string {
    return productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  addToCartButton(productName: string): Locator {
    return this.page.getByTestId(`add-to-cart-${InventoryPage.slug(productName)}`);
  }

  removeButton(productName: string): Locator {
    return this.page.getByTestId(`remove-${InventoryPage.slug(productName)}`);
  }

  async addToCart(...productNames: string[]): Promise<void> {
    for (const name of productNames) {
      await this.addToCartButton(name).click();
      await expect(this.removeButton(name)).toBeVisible();
    }
  }

  async removeFromCart(...productNames: string[]): Promise<void> {
    for (const name of productNames) {
      await this.removeButton(name).click();
      await expect(this.addToCartButton(name)).toBeVisible();
    }
  }

  async imageSources(): Promise<string[]> {
    await expect(this.itemImages.first()).toBeVisible();
    return this.itemImages.evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src') ?? ''));
  }
}

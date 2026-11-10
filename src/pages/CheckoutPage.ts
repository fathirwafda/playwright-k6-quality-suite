import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Covers the three checkout steps: information, overview and complete. */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';

  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly error: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.error = page.getByTestId('error');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async fillInformation(info: Partial<CustomerInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstName.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastName.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCode.fill(info.postalCode);
    await this.continueButton.click();
  }

  async expectOverview(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(this.title).toHaveText('Checkout: Overview');
  }

  /** Parses "Item total: $29.99" / "Tax: $2.40" / "Total: $32.39" into numbers. */
  static amount(label: string): number {
    const match = /\$(\d+(?:\.\d+)?)/.exec(label);
    if (!match?.[1]) throw new Error(`No amount in label: "${label}"`);
    return Number(match[1]);
  }

  async totals(): Promise<{ subtotal: number; tax: number; total: number; itemSum: number }> {
    const prices = (await this.itemPrices.allInnerTexts()).map((p) => CheckoutPage.amount(p));
    return {
      subtotal: CheckoutPage.amount(await this.subtotal.innerText()),
      tax: CheckoutPage.amount(await this.tax.innerText()),
      total: CheckoutPage.amount(await this.total.innerText()),
      itemSum: prices.reduce((a, b) => a + b, 0),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/\/checkout-complete\.html$/);
  }
}

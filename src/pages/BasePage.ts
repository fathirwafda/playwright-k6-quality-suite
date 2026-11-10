import type { Locator, Page } from '@playwright/test';

/** Shared behaviour for every Sauce Demo page object. */
export abstract class BasePage {
  /** Path relative to the UI baseURL. */
  protected abstract readonly path: string;

  readonly title: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByTestId('title');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}

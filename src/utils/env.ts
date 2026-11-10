import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ quiet: true });

export const env = {
  uiBaseUrl: process.env.UI_BASE_URL ?? 'https://www.saucedemo.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
  isCI: !!process.env.CI,
  /** Opt-in for OS-dependent visual snapshot tests. */
  visual: process.env.VISUAL === '1',
} as const;

export const STORAGE_STATE = path.resolve(__dirname, '..', '..', '.auth', 'standard_user.json');

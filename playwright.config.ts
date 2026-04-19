import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  use: {
    baseURL: 'https://6-noob7-hack-frontend-test.vercel.app/',
    browserName: 'chromium',
    headless: true,
  },
});

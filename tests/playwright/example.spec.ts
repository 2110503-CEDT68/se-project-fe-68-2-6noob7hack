import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('https://6-noob7-hack-frontend-test.vercel.app/');
  await expect(page).toHaveTitle(/CoSpace/);
});

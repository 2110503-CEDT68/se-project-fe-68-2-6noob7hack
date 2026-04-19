import { test, expect } from '@playwright/test';

// login as admin
async function loginAsAdmin(page) {
  await page.goto('https://6-noob7-hack-frontend-test.vercel.app/');
  await page.click('a.TopMenu_signin__ai_h0');
  await page.fill('input[type="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('https://6-noob7-hack-frontend-test.vercel.app/');
}

// go directly to Edit Room form (fixed workspace + room id)
async function goToEditRoomForm(page) {
  await page.goto(
    'https://6-noob7-hack-frontend-test.vercel.app/workspace/69ba6b8668c96351d907a3a1/rooms/69e4def95db0d567e73d39a2/edit'
  );
  await expect(page).toHaveURL(/\/rooms\/.*\/edit$/);
}

test.describe('TC2: Admin Edit Room', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToEditRoomForm(page);
  });

  // TC2-1: edit with unique name
  test('TC2-1: Edit room with unique name', async ({ page }) => {
    await page.fill('input[name="name"]', 'Meeting Room F');
    await page.fill('input[name="capacity"]', '10');
    await page.fill('input[name="price"]', '250');
    await page.fill('input[name="picture"]', ''); // picture left empty/null

    await page.click('button[type="submit"]'); // Update Room
    await expect(page).toHaveURL(/\/rooms$/);
    await expect(page.locator('text=Meeting Room F')).toBeVisible();
  });

  // TC2-2: duplicate room name
  test('TC2-2: Duplicate room name', async ({ page }) => {
    await page.fill('input[name="name"]', 'Meeting Room C'); // duplicate
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Duplicate room name');
      await dialog.dismiss();
    });
    await page.click('button[type="submit"]');
  });

  // TC2-3: no fields changed
  test('TC2-3: No fields changed', async ({ page }) => {
    // don’t change any inputs, just click save
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('No changes detected');
      await dialog.dismiss();
    });
    await page.click('button[type="submit"]');
  });
});

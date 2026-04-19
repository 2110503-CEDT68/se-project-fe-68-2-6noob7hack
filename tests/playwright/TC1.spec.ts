import { test, expect } from '@playwright/test';

let createdRoomName: string; // shared between tests

// login as admin
async function loginAsAdmin(page) {
  await page.goto('https://6-noob7-hack-frontend-test.vercel.app/');
  await page.click('a.TopMenu_signin__ai_h0');
  await page.fill('input[type="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('https://6-noob7-hack-frontend-test.vercel.app/');
}

// go directly to Add Room form in fixed workspace
async function goToAddRoomForm(page) {
  await page.goto('https://6-noob7-hack-frontend-test.vercel.app/workspace/69ba6b8668c96351d907a3a1/rooms/create');
  await expect(page).toHaveURL(/\/rooms\/create$/);
}

test.describe('TC1: Admin Add Room', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToAddRoomForm(page);
  });

  // TC1-1: add unique room
  test('TC1-1: Add unique room', async ({ page }) => {
    createdRoomName = `Meeting Room ${Date.now()}`;
    await page.fill('input[name="name"]', createdRoomName);
    await page.fill('input[name="capacity"]', '10');
    await page.fill('input[name="price"]', '250');
    await page.fill('input[name="picture"]', '');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/rooms$/);
    await expect(page.locator(`text=${createdRoomName}`)).toBeVisible();
  });

  // TC1-2: empty room name
  test('TC1-2: Empty room name', async ({ page }) => {
    await page.fill('input[name="name"]', '');
    await page.fill('input[name="capacity"]', '10');
    await page.fill('input[name="price"]', '250');
    await page.click('button[type="submit"]');

    const validationMessage = await page.locator('input[name="name"]').evaluate(el => el.validationMessage);
    expect(validationMessage).toContain('Please fill out this field');
  });

  // TC1-3: duplicate room name
    test('TC1-3: Duplicate room name', async ({ page }) => {
    const duplicateName = createdRoomName || 'Meeting Room B';

    await page.fill('input[name="name"]', duplicateName);
    await page.fill('input[name="capacity"]', '10');
    await page.fill('input[name="price"]', '250');

    // Listen for the alert dialog triggered after submit
    page.once('dialog', async dialog => {
        console.log('Dialog message:', dialog.message());
        expect(dialog.message()).toContain('Room name already exists in this coworking space');
        await dialog.dismiss(); // close the alert
    });

    await page.click('button[type="submit"]');
    });

});

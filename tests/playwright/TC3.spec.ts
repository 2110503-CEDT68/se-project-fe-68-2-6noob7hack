import { test, expect } from '@playwright/test';

async function loginAsAdmin(page) {
  await page.goto('https://6-noob7-hack-frontend-test.vercel.app/');
  await page.click('a.TopMenu_signin__ai_h0');
  await page.fill('input[type="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL('https://6-noob7-hack-frontend-test.vercel.app/');
}

async function goToRoomDetail(page, roomId: string) {
  await page.goto(`https://6-noob7-hack-frontend-test.vercel.app/workspace/69ba6b8668c96351d907a3a1/rooms/${roomId}`);
  await expect(page).toHaveURL(/\/rooms\/[a-z0-9]+$/);
}

test.describe('TC3: Admin Delete Room', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // TC3-1: create new room and delete it
  test('TC3-1: Delete room with no reservations', async ({ page }) => {
    const roomName = `Temp Room ${Date.now()}`;
    // inline createRoom
    await page.goto('https://6-noob7-hack-frontend-test.vercel.app/workspace/69ba6b8668c96351d907a3a1/rooms/create');
    await page.fill('input[name="name"]', roomName);
    await page.fill('input[name="capacity"]', '5');
    await page.fill('input[name="price"]', '100');
    await page.fill('input[name="picture"]', '');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/rooms$/);
    await expect(page.getByText(roomName)).toBeVisible();

    // extract roomId from link
    const roomLink = page.locator('.RoomsPage_roomCard__4lXE5', { hasText: roomName })
      .getByRole('link', { name: 'Check availability →' });
    const href = await roomLink.getAttribute('href');
    const roomId = href?.split('/').pop();

    await goToRoomDetail(page, roomId!);

    page.once('dialog', async d => {
      expect(d.message()).toContain('Are you sure you want to delete this room?');
      await d.accept();
    });

    await page.getByRole('button', { name: 'Delete Room' }).click();
    await expect(page.getByText(roomName)).toHaveCount(0);
  });

  // TC3-2: go to pre-created room and try to delete
  test('TC3-2: Attempt to delete room with active reservations', async ({ page }) => {
    await goToRoomDetail(page, '69e4e1b8c28927fce39a3c80');

    page.once('dialog', async d => {
      expect(d.message()).toContain('Are you sure you want to delete this room? This action cannot be undone.');
      await d.accept();
    });

    await page.getByRole('button', { name: 'Delete Room' }).click();

    // second dialog
    page.once('dialog', async d => {
      expect(d.message()).toContain('Room has active reservations');
      await d.dismiss();
    });
  });

  // TC3-3: create new room, delete it, then try to delete again
  test('TC3-3: Duplicate delete request', async ({ page }) => {
    const roomName = `Temp Room ${Date.now()}`;
    // create room
    await page.goto('https://6-noob7-hack-frontend-test.vercel.app/workspace/69ba6b8668c96351d907a3a1/rooms/create');
    await page.fill('input[name="name"]', roomName);
    await page.fill('input[name="capacity"]', '5');
    await page.fill('input[name="price"]', '100');
    await page.fill('input[name="picture"]', '');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/rooms$/);
    await expect(page.getByText(roomName)).toBeVisible();

    const roomLink = page.locator('.RoomsPage_roomCard__4lXE5', { hasText: roomName })
        .getByRole('link', { name: 'Check availability →' });
    const href = await roomLink.getAttribute('href');
    const roomId = href?.split('/').pop();

    await goToRoomDetail(page, roomId!);

    // first delete
    page.once('dialog', async d => {
        expect(d.message()).toContain('Are you sure you want to delete this room?');
        await d.accept();
    });
    await page.getByRole('button', { name: 'Delete Room' }).click();

    // error dialog after deletion
    page.once('dialog', async d => {
        expect(d.message()).toContain('Failed to fetch'); // adjust to actual backend wording
        await d.accept();
    });

    // try to delete again
    await goToRoomDetail(page, roomId!);
    page.once('dialog', async d => {
        expect(d.message()).toContain('Are you sure you want to delete this room?');
        await d.accept();
    });
    await page.getByRole('button', { name: 'Delete Room' }).click();

    // duplicate delete error dialog
    page.once('dialog', async d => {
        expect(d.message()).toContain('Failed to fetch'); // or "already deleted" if backend changes
        await d.dismiss();
    });
  });
});

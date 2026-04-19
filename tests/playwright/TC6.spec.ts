import { test, expect } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend-test.vercel.app';

async function loginTC6User(page) {
  await page.goto(BASE_URL);
  await page.click('a.TopMenu_signin__ai_h0');
  await page.fill('input[type="email"]', 'tc6user@gmail.com');
  await page.fill('input[type="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForURL(BASE_URL + '/');
}

test.describe('TC6: My Booking Cancel, Delete, and Rebook', () => {

  test('TC6-1: Edit reservation shows disabled time slots', async ({ page }) => {
    await loginTC6User(page);

    await page.goto(`${BASE_URL}/mybooking`);
    await expect(page.locator('h2.BookingList_title__TgHF5')).toHaveText('My Reservations');

    await page.locator('button.BookingList_btnEdit__T9RXB').click();
    await expect(page.getByText(/Edit Reservation/i)).toBeVisible();

    const modal = page.locator('div[style*="background: rgb(255, 255, 255)"]').first();
    const disabledSlot = modal.locator('div[style*="cursor: not-allowed"]').first();
    await expect(disabledSlot).toBeVisible();
    await expect(disabledSlot).toHaveCSS('opacity', '0.4');

    const saveBtn = modal.locator('button:has-text("Save")');
    await expect(saveBtn).toBeDisabled();

    const selectedSlot = modal.locator('div[style*="background: rgb(8, 145, 178)"]').first();
    await expect(selectedSlot).toBeVisible();
  });

  test('TC6-2: Cancel reservation, delete it, then rebook same slot', async ({ page }) => {
    await loginTC6User(page);

    // Step 1: Go to My Booking
    await page.goto(`${BASE_URL}/mybooking`);
    await expect(page.locator('h2.BookingList_title__TgHF5')).toHaveText('My Reservations');

    // Step 2: Click Edit
    await page.locator('button.BookingList_btnEdit__T9RXB').click();
    await expect(page.getByText(/Edit Reservation/i)).toBeVisible();

    // Step 3: Register dialog handler BEFORE clicking Cancel
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Cancel this reservation?');
      await dialog.accept();
    });

    // Step 4: Click Cancel inside modal
    const modal = page.locator('div[style*="background: rgb(255, 255, 255)"]').first();
    await modal.locator('button', { hasText: 'Cancel' }).click();

    // Step 5: Verify reservation status changes to Cancelled
    const cancelledCard = page.locator('.BookingList_reservationCard__xZf0T')
      .filter({ hasText: '27 Apr 2026 at 09:00 - 10:00' });
    const cancelledBadge = cancelledCard.locator('.BookingList_statusBadge__miLRm');
    await expect(cancelledBadge).toHaveText(/Cancelled/i);

    // Step 6: Register dialog handler BEFORE clicking Delete
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Permanently delete this reservation');
      await dialog.accept();
    });

    // Step 7: Click Delete button inside the cancelled card
    await cancelledCard.locator('button.BookingList_btnDelete__1yroi').click();

    // Step 8: Verify the card is removed
    await expect(cancelledCard).toHaveCount(0);

    // Step 9: Navigate back to the room page
    await page.goto(`${BASE_URL}/workspace/69a53b1e3ae97f7530457bf0/rooms/69e4a3606dd4ea2146105564`);

    // Step 10: Select date 27/04/2026
    const dateInput = page.locator('input.RoomPage_dateInput__0JqvT');
    await dateInput.fill('27/04/2026');
    await dateInput.press('Enter');
    await expect(dateInput).toHaveValue('27/04/2026');

    // Step 11: Wait for slot grid to render
    const slotGrid = page.locator('.RoomPage_slotGrid__rZIQE');
    await expect(slotGrid).toBeVisible();

    // Step 12: Verify slot 09:00 - 10:00 is available
    const slot910 = slotGrid.locator('.RoomPage_slot__AEDc1.RoomPage_slotAvailable__I2_2j')
      .filter({ hasText: '09:00 - 10:00' })
      .first();
    await expect(slot910).toBeVisible();

    // Step 13: Select slot and confirm reservation
    await slot910.click();
    const confirmBtn = page.locator('button.RoomPage_bookBtn__UzYRl');
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Step 14: Assert reservation success message
    const message = page.locator('.RoomPage_message__DTsTY');
    await expect(message).toBeVisible();
  });

});

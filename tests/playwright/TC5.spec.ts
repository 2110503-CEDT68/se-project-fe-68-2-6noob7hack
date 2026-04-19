import { test, expect } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend-test.vercel.app';

function generateRandomEmail() {
  return `user${Date.now()}@example.com`;
}

function getUniqueFutureDate() {
  const now = Date.now();
  const daysAhead = Math.floor(Math.random() * 365) + 365;
  const future = new Date(now + daysAhead * 24 * 60 * 60 * 1000);

  const dd = String(future.getDate()).padStart(2, '0');
  const mm = String(future.getMonth() + 1).padStart(2, '0');
  const yyyy = future.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function loginAsAdmin(page) {
  await page.goto(BASE_URL);
  await page.click('a.TopMenu_signin__ai_h0');
  await page.fill('input[type="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL(BASE_URL + '/');
}

test.describe('TC5: Reservation Creation', () => {

  test('TC5-1: Register new user and reserve future slot in Conference Room A', async ({ page }) => {
    const randomEmail = generateRandomEmail();
    const password = 'TestPassword123';

    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="telephoneNumber"]', '0812345678');
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.check('#agreement');
    await page.click('button.Register_submitBtn__28D9y');
    await expect(page).toHaveURL(/signin/);

    await page.fill('input[type="email"]', randomEmail);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(BASE_URL + '/');

    await page.goto(`${BASE_URL}/workspace/69ba6b8668c96351d907a3a1/rooms/69e5119ba6ca18740d087feb`);
    await expect(page.getByText(/Reserve a Space/i)).toBeVisible();

    const dateInput = page.locator('input.RoomPage_dateInput__0JqvT');
    const uniqueFutureDate = getUniqueFutureDate();
    await dateInput.fill(uniqueFutureDate);
    await expect(dateInput).toHaveValue(uniqueFutureDate);

    await page.waitForSelector('.RoomPage_slotAvailable__I2_2j', { timeout: 2000 });

    const slots = page.locator('.RoomPage_slotAvailable__I2_2j');
    const count = await slots.count();
    expect(count).toBeGreaterThan(0);
    const randomIndex = Math.floor(Math.random() * count);
    await slots.nth(randomIndex).click();

    const confirmBtn = page.locator('button.RoomPage_bookBtn__UzYRl');
    await confirmBtn.click();

    const message = page.locator('.RoomPage_message__DTsTY');
    await expect(message).toBeVisible();
  });

  test('TC5-2: Prevent booking already reserved slot in Meeting Room M', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto(`${BASE_URL}/workspace/69ba6b8668c96351d907a3a1/rooms/69e516faa6ca18740d0880fd`);
    await expect(page.getByText(/Reserve a Space/i)).toBeVisible();

    const dateInput = page.locator('input.RoomPage_dateInput__0JqvT');
    await dateInput.fill('28/04/2026');
    await expect(dateInput).toHaveValue('28/04/2026');

    // Assert the booked slot exists
    const bookedSlot = page.locator('.RoomPage_slot__AEDc1.RoomPage_slotBooked__gVwfu', {
      hasText: '12:00 - 13:00'
    });
    await expect(bookedSlot).toBeVisible();

    // Assert booking button is disabled
    const bookBtn = page.locator('button.RoomPage_bookBtn__UzYRl');
    await expect(bookBtn).toBeDisabled();
  });

  test('TC5-3: Prevent submission when no room and no slot selected', async ({ page }) => {
    // Step 1: Login as admin
    await loginAsAdmin(page);

    // Step 2: Go to Meeting Room M (or any room page)
    await page.goto(`${BASE_URL}/workspace/69ba6b8668c96351d907a3a1/rooms/69e516faa6ca18740d0880fd`);
    await expect(page.getByText(/Reserve a Space/i)).toBeVisible();

    // Step 3: Do not select any slot
    // (skip clicking on any .RoomPage_slotAvailable__I2_2j)

    // Step 4: Assert that the confirm button is disabled
    const confirmBtn = page.locator('button.RoomPage_bookBtn__UzYRl');
    await expect(confirmBtn).toBeDisabled();
  });
});

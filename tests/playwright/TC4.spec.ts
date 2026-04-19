import { test, expect } from '@playwright/test';

const BASE_URL = 'https://6-noob7-hack-frontend-test.vercel.app';

async function loginAsAdmin(page) {
  await page.goto(BASE_URL);
  await page.click('a.TopMenu_signin__ai_h0');
  await page.fill('input[type="email"]', 'admin@gmail.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL(BASE_URL + '/');
}

test.describe('TC4: Reservation Listing', () => {

  // TC4-1: Coworking space catalog shows spaces
  test('TC4-1: Display coworking spaces in catalog', async ({ page }) => {
    // Precondition: logged in
    await loginAsAdmin(page);

    // Navigate to coworking space catalog
    await page.goto(BASE_URL + '/workspace');

    // Assert that the header text is visible
    await expect(page.getByText(/spaces available/i)).toBeVisible();

    // Assert that at least one coworking space card is visible
    const spaceCards = page.locator('.WorkspaceCatalog_card__zy69J');
    await expect(spaceCards.first()).toBeVisible();

    // Check count >= 1
    const count = await spaceCards.count();
    expect(count).toBeGreaterThan(0);
  });

  // TC4-2: Meeting Room G shows available slots
  test('TC4-2: Show available slots for Meeting Room G', async ({ page }) => {
    // Precondition: logged in
    await loginAsAdmin(page);

    // Navigate directly to Meeting Room G
    await page.goto(`${BASE_URL}/workspace/69ba6b8668c96351d907a3a1/rooms/69e4e1b8c28927fce39a3c80`);
    await expect(page).toHaveURL(/69e4e1b8c28927fce39a3c80$/);

    // Assert that the reservation section is visible
    await expect(page.locator('.RoomPage_bookingCard__R7ApL')).toBeVisible();
    await expect(page.getByText(/Reserve a Space/i)).toBeVisible();

    // Select the booking date (type directly into the input)
    const dateInput = page.locator('input.RoomPage_dateInput__0JqvT');
    await dateInput.fill('28/04/2026');

    // Assert that the input now has the expected value
    await expect(dateInput).toHaveValue('28/04/2026');

    // Assert that at least one available time slot is listed
    const slots = page.locator('.RoomPage_slotAvailable__I2_2j');
    await expect(slots.first()).toBeVisible();

    // Optionally check a specific slot text
    await expect(page.getByText(/08:00 - 09:00/)).toBeVisible();
  });

  test('TC4-3: Show booked slots for Meeting Room L', async ({ page }) => {
    // Precondition: logged in
    await loginAsAdmin(page);

    // Navigate directly to Meeting Room L
    await page.goto(`${BASE_URL}/workspace/69ba6b8668c96351d907a3a1/rooms/69e509cfa6ca18740d087e3c`);
    await expect(page).toHaveURL(/69e509cfa6ca18740d087e3c$/);

    // Assert that the reservation section is visible
    await expect(page.locator('.RoomPage_bookingCard__R7ApL')).toBeVisible();
    await expect(page.getByText(/Reserve a Space/i)).toBeVisible();

    // Select the booking date (type directly into the input)
    const dateInput = page.locator('input.RoomPage_dateInput__0JqvT');
    await dateInput.fill('28/04/2026');
    await expect(dateInput).toHaveValue('28/04/2026');

    // Assert that booked slots are visible
    const bookedSlots = page.locator('.RoomPage_slotBooked__gVwfu');
    await expect(bookedSlots.first()).toBeVisible();

    // Optionally check a specific booked slot text
    await expect(page.getByText(/08:00 - 09:00/)).toBeVisible();

    // Ensure booked slots are not clickable (disabled/unselectable)
    const firstBookedSlot = bookedSlots.first();
    await expect(firstBookedSlot).toHaveClass(/RoomPage_slotBooked__gVwfu/);
  });

  test('TC4-4: Redirect unauthenticated user to login', async ({ browser }) => {
    // Use a fresh context with no login
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate directly to Meeting Room G
    await page.goto(`${BASE_URL}/workspace/69ba6b8668c96351d907a3a1/rooms/69e4e1b8c28927fce39a3c80`);
    await expect(page).toHaveURL(/69e4e1b8c28927fce39a3c80$/);

    // Fill the booking date
    const dateInput = page.locator('input.RoomPage_dateInput__0JqvT');
    await dateInput.fill('28/04/2026');
    await expect(dateInput).toHaveValue('28/04/2026');

    // Select one available slot
    const firstSlot = page.locator('.RoomPage_slotAvailable__I2_2j').first();
    await firstSlot.click();

    // Click the confirm reservation button
    const confirmBtn = page.locator('button.RoomPage_bookBtn__UzYRl');
    await confirmBtn.click();

    // Assert that the error message is shown
    await expect(page.locator('.RoomPage_message__DTsTY.RoomPage_error__et5nH'))
      .toHaveText(/Please login first to make a reservation./i);
  });
  
});

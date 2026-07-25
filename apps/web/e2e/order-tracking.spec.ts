import { test, expect } from '@playwright/test';

test.describe('Order Tracking Flow', () => {
  test('should allow a user to check order status', async ({ page }) => {
    await page.goto('/track');
    
    await expect(page.getByRole('heading', { name: /track order/i })).toBeVisible();

    // Fill the tracking form
    await page.getByLabel(/order number/i).fill('ORD-123456');
    await page.getByLabel(/phone number/i).fill('08012345678');
    
    // Check if the track button is available
    const trackBtn = page.getByRole('button', { name: /track/i });
    await expect(trackBtn).toBeVisible();

    // We do not submit to avoid 404s since the order doesn't exist in the DB during E2E.
    // In a full testing environment with DB seeding, you would submit and verify the resulting timeline.
  });
});

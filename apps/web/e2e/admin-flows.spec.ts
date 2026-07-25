import { test, expect } from '@playwright/test';

test.describe('Admin Flows', () => {
  // We can't actually log in as an admin unless we have credentials in the test environment.
  // We will test that the admin dashboard routes are protected and redirect to login,
  // or if we somehow can access them, that the UI elements are present.
  
  test('should redirect unauthenticated users away from admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Expect to be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect unauthenticated users away from admin products page', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect unauthenticated users away from admin orders page', async ({ page }) => {
    await page.goto('/admin/orders');
    await expect(page).toHaveURL(/.*\/login/);
  });
});

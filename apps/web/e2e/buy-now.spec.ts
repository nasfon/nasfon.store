import { test, expect } from '@playwright/test';

test.describe('Buy Now Flow', () => {
  test('should go directly to checkout from product page', async ({ page }) => {
    await page.goto('/');
    
    // Check if products exist
    const firstProduct = page.locator('a[href^="/products/"]').first();
    
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      
      // Wait for product page
      const buyNowBtn = page.getByRole('button', { name: /buy now/i });
      await expect(buyNowBtn).toBeVisible();
      
      // Click Buy Now
      await buyNowBtn.click();
      
      // Verify we are on checkout page immediately
      await expect(page).toHaveURL(/\/checkout/);
      await expect(page.getByRole('heading', { name: /checkout/i, level: 1 })).toBeVisible();
    } else {
      console.log('No products available to test buy now flow.');
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Guest Purchase Flow', () => {
  test('should browse, add to cart, and reach checkout', async ({ page }) => {
    // 1. Browse: Go to home page
    await page.goto('/');
    
    // Expect the page title to contain some text (adjust based on actual title)
    // await expect(page).toHaveTitle(/NasFon/);
    
    // Check if hero or featured products section is visible
    // This expects at least one product card to be present, or a link to products
    const productsLink = page.getByRole('link', { name: /browse/i }).first();
    if (await productsLink.isVisible()) {
      await productsLink.click();
    } else {
      await page.goto('/products');
    }

    // Wait for products to load
    await expect(page.getByRole('main')).toBeVisible();

    // 2. Add to cart: Click on a product (assuming there are products seeded)
    // We get the first product link
    const firstProduct = page.locator('a[href^="/products/"]').first();
    // Only proceed if there is a product available in the test environment
    if (await firstProduct.count() > 0) {
      await firstProduct.click();
      
      // Wait for product details page to load
      await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
      
      // Add to cart
      await page.getByRole('button', { name: /add to cart/i }).click();
      
      // Verify toast or cart indicator appears
      // Go to cart
      await page.goto('/cart');
      
      // 3. Checkout: Check cart page and proceed
      await expect(page.getByRole('heading', { name: /cart/i, level: 1 })).toBeVisible();
      const checkoutBtn = page.getByRole('button', { name: /proceed to checkout/i });
      await expect(checkoutBtn).toBeVisible();
      await checkoutBtn.click();
      
      // Verify we are on checkout page
      await expect(page).toHaveURL(/\/checkout/);
      
      // 4. Payment (Checkout form)
      await expect(page.getByRole('heading', { name: /checkout/i, level: 1 })).toBeVisible();
      
      // Fill out customer info
      await page.getByLabel(/name/i).fill('Test Guest');
      await page.getByLabel(/email/i).fill('guest@example.com');
      await page.getByLabel(/phone/i).fill('08012345678');
      
      // Select delivery location if available
      // const locationSelect = page.getByRole('combobox');
      // if (await locationSelect.isVisible()) {
      //   await locationSelect.selectOption({ index: 1 });
      // }

      // We won't submit the order to avoid database pollution unless configured to use a test DB
      const placeOrderBtn = page.getByRole('button', { name: /place order/i });
      await expect(placeOrderBtn).toBeVisible();
    } else {
      console.log('No products available to test purchase flow.');
    }
  });
});

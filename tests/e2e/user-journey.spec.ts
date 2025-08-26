import { test, expect } from '@playwright/test';

test.describe('User Journey - Complete Shopping Flow', () => {
  test('should complete full shopping journey from homepage to checkout', async ({ page }) => {
    // 1. Start on homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Akanda Apéro/i);

    // 2. Navigate to products page
    await page.getByRole('link', { name: /produits|apéros/i }).first().click();
    await page.waitForLoadState('networkidle');
    
    // 3. Add product to cart
    const productCard = page.locator('[data-testid="product-card"], .product-card').first();
    if (await productCard.isVisible()) {
      const addToCartButton = productCard.locator('button:has-text("Ajouter"), button[aria-label*="ajouter"]').first();
      await addToCartButton.click();
      
      // Wait for cart update
      await page.waitForTimeout(1000);
    }

    // 4. Go to cart
    const cartButton = page.locator('[data-testid="cart-button"], .cart-button, [aria-label*="panier"]').first();
    await cartButton.click();
    
    // 5. Verify cart has items
    await expect(page.locator('[data-testid="cart-item"], .cart-item').first()).toBeVisible({ timeout: 5000 });

    // 6. Proceed to checkout
    const checkoutButton = page.getByRole('button', { name: /commander|checkout|finaliser/i }).first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on checkout page
      await expect(page.locator('form, [data-testid="checkout-form"]').first()).toBeVisible();
    }
  });

  test('should navigate through cocktail section', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to cocktails section
    await page.getByRole('link', { name: /cocktails/i }).first().click();
    await page.waitForLoadState('networkidle');
    
    // Check if cocktails are displayed
    const cocktailCards = page.locator('[data-testid="cocktail-card"], .cocktail-card');
    const cocktailCount = await cocktailCards.count();
    
    if (cocktailCount > 0) {
      // Click on first cocktail
      await cocktailCards.first().click();
      await page.waitForLoadState('networkidle');
      
      // Verify cocktail details are shown
      await expect(page.locator('[data-testid="cocktail-details"], .cocktail-details, h1, .recipe').first()).toBeVisible();
    }
  });

  test('should handle user authentication flow', async ({ page }) => {
    await page.goto('/');
    
    // Click on login/user button
    const authButton = page.locator('[data-testid="user-button"], .user-button, [aria-label*="connexion"]').first();
    await authButton.click();
    
    // Check if login form or dropdown appears
    const loginForm = page.locator('form[data-testid="login-form"], .login-form, [role="dialog"]').first();
    const userDropdown = page.locator('[data-testid="user-dropdown"], .user-dropdown').first();
    
    // Either login form should appear or user dropdown (if already logged in)
    await expect(loginForm.or(userDropdown)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Dashboard Access', () => {
  test('should load admin dashboard (if accessible)', async ({ page }) => {
    // Try to access admin dashboard
    await page.goto('/admin');
    
    // Check if we're redirected to login or if dashboard loads
    const currentUrl = page.url();
    
    if (currentUrl.includes('/admin')) {
      // Admin dashboard loaded
      await expect(page.locator('[data-testid="admin-dashboard"], .admin-dashboard, nav').first()).toBeVisible();
    } else {
      // Redirected to login - this is expected behavior
      await expect(page.locator('form, [data-testid="login-form"]').first()).toBeVisible();
    }
  });
});

test.describe('Performance and Accessibility', () => {
  test('should load pages within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/');
    
    // Check for essential meta tags
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    if (description) {
      expect(description.length).toBeGreaterThan(50);
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = await page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();
  });
});

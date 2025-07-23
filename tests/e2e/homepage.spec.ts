import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/Akanda Apéro/i);
    
    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Check for main navigation links
    await expect(page.getByRole('link', { name: /accueil/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /produits/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /cocktails/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
  });

  test('should have working cart functionality', async ({ page }) => {
    // Look for cart button/icon
    const cartButton = page.locator('[data-testid="cart-button"], .cart-button, [aria-label*="panier"]').first();
    
    if (await cartButton.isVisible()) {
      await expect(cartButton).toBeVisible();
      
      // Click on cart
      await cartButton.click();
      
      // Check if cart modal/page opens
      await expect(page.locator('[data-testid="cart-modal"], .cart-modal, [role="dialog"]').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have user authentication button', async ({ page }) => {
    // Look for login/user button
    const authButton = page.locator('[data-testid="user-button"], .user-button, [aria-label*="connexion"], [aria-label*="compte"]').first();
    
    await expect(authButton).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if page is still functional
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    
    // Check if mobile menu works (if exists)
    const mobileMenuButton = page.locator('[data-testid="mobile-menu"], .mobile-menu-button, [aria-label*="menu"]').first();
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('[data-testid="mobile-menu-content"], .mobile-menu-content').first()).toBeVisible();
    }
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('net::ERR_FAILED') &&
      !error.toLowerCase().includes('warning')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

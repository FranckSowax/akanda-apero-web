import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E tests environment...');
  
  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:3002');
    
    // Wait for the main page to load
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Check if the app is running properly
    const title = await page.title();
    console.log(`✅ Application is ready. Page title: ${title}`);
    
    // You can add more setup logic here:
    // - Create test users
    // - Seed test data
    // - Set up test environment variables
    
  } catch (error) {
    console.error('❌ Failed to set up E2E tests environment:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;

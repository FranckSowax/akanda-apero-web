import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E tests environment...');
  
  try {
    // Add cleanup logic here:
    // - Remove test data
    // - Clean up test users
    // - Reset test environment
    
    console.log('✅ E2E tests environment cleaned up successfully');
    
  } catch (error) {
    console.error('❌ Failed to clean up E2E tests environment:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;

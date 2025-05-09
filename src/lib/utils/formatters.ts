/**
 * Utility functions for formatting data consistently between server and client
 */

/**
 * Format a price with consistent formatting regardless of locale to prevent hydration errors
 * Using a fixed format with commas as thousand separators
 */
export function formatPrice(price: number): string {
  // Format with commas for thousand separators and always 0 decimal places
  return price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

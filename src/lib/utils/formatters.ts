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

/**
 * Convert a string to a URL-friendly slug
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()                           // Convert to string
    .normalize('NFD')                     // Separate accented characters
    .replace(/[\u0300-\u036f]/g, '')        // Remove diacritics
    .toLowerCase()                        // Convert to lowercase
    .trim()                               // Remove whitespace from ends
    .replace(/\s+/g, '-')                 // Replace spaces with -
    .replace(/[^\w\-]+/g, '')             // Remove all non-word chars
    .replace(/\-\-+/g, '-')               // Replace multiple - with single -
    .replace(/^-+/, '')                   // Trim - from start of text
    .replace(/-+$/, '');                  // Trim - from end of text
}

/**
 * CarbonLedger — Sanitization Utilities
 */
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML strings to prevent XSS.
 * @param {string} str - The string to sanitize.
 * @returns {string} The sanitized string.
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return DOMPurify.sanitize(String(str));
}

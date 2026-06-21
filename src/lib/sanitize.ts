/**
 * Input sanitization utilities for SentraOps.
 *
 * All functions are pure and have no external dependencies.
 */

/**
 * Trims whitespace, removes control characters (ASCII 0–31 except \t, \n, \r),
 * and strips HTML tags using regex.
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<[^>]*>/g, '')
}

/**
 * Escapes HTML special characters (&, <, >, ", ') to their entity equivalents.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Recursively trims all string values in an object.
 * Non-string values and arrays are passed through unchanged.
 */
export function trimAll(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = value.trim()
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = trimAll(value as Record<string, unknown>)
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Keeps only digits, +, and - characters. Useful for phone number fields.
 */
export function sanitizePhone(input: string): string {
  return input.replace(/[^0-9+-]/g, '')
}

/**
 * Keeps only digits and the decimal point. Useful for numeric input fields.
 */
export function sanitizeNumeric(input: string): string {
  return input.replace(/[^0-9.]/g, '')
}

/**
 * Removes HTML tags (including script/style tags) via regex.
 * This is a more aggressive alternative to sanitizeString.
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

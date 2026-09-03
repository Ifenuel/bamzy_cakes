/**
 * Strip HTML tags from a string to prevent XSS attacks.
 * @param {string} input
 * @returns {string}
 */
export function stripHtml(input) {
  if (typeof input !== 'string') return input
  return input.replace(/<[^>]*>/g, '').trim()
}

/**
 * Sanitize an object's string values by stripping HTML tags.
 * @param {object} obj
 * @returns {object}
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const sanitized = { ...obj }
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = stripHtml(sanitized[key])
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map((item) =>
        typeof item === 'string' ? stripHtml(item) : item
      )
    }
  }
  return sanitized
}

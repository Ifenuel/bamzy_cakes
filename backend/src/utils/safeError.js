/**
 * Safe error handler for controllers.
 * Logs the real error to console for debugging,
 * returns a safe generic message to the client.
 * Never expose SQL errors, file paths, or stack traces to the frontend.
 */
export function safeError(res, err, fallbackMessage = 'Something went wrong', statusCode = 500) {
  console.error(`[ERROR] ${fallbackMessage}:`, err.message || err)
  return res.status(statusCode).json({
    success: false,
    message: fallbackMessage,
  })
}

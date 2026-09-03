import { logError } from '../utils/logger.js'

export function errorHandler(err, req, res, _next) {
  logError(err)

  return res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  })
}

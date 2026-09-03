import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOG_DIR = path.join(__dirname, '../../logs')

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

function getTimestamp() {
  return new Date().toISOString()
}

function formatError(err) {
  return `[${getTimestamp()}] ${err.stack || err.message || String(err)}\n`
}

export function logError(err) {
  const message = formatError(err)
  console.error(message)
  
  // Append to error log file
  const logFile = path.join(LOG_DIR, `error-${new Date().toISOString().split('T')[0]}.log`)
  fs.appendFileSync(logFile, message)
}

export function logInfo(message) {
  console.log(`[${getTimestamp()}] ${message}`)
}

export function logRequest(req, res, next) {
  const start = Date.now()
  res?.on?.('finish', () => {
    const duration = Date.now() - start
    const log = `[${getTimestamp()}] ${req.method} ${req.originalUrl} ${res?.statusCode || '?'} ${duration}ms\n`
    const logFile = path.join(LOG_DIR, `access-${new Date().toISOString().split('T')[0]}.log`)
    fs.appendFileSync(logFile, log)
  })
  next()
}

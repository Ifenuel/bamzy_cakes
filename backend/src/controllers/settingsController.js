import pool from '../config/db.js'
import { success } from '../utils/response.js'
import { safeError } from '../utils/safeError.js'

export async function getSettings(req, res) {
  try {
    const result = await pool.query('SELECT key, value FROM business_settings ORDER BY id')
  const settings = {}
  for (const row of result.rows) {
    // Parse JSON-encoded values (they were JSON.stringify'd on save)
    try {
      settings[row.key] = JSON.parse(row.value)
    } catch {
      settings[row.key] = row.value
    }
  }
  return success(res, settings)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function updateSettings(req, res) {
  try {
    const updates = req.body

    for (const [key, value] of Object.entries(updates)) {
      await pool.query(
        `INSERT INTO business_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      )
    }

    // Return updated settings
    const result = await pool.query('SELECT key, value FROM business_settings ORDER BY id')
  const settings = {}
  for (const row of result.rows) {
    // Parse JSON-encoded values (they were JSON.stringify'd on save)
    try {
      settings[row.key] = JSON.parse(row.value)
    } catch {
      settings[row.key] = row.value
    }
  }
  return success(res, settings)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

import { Router } from 'express'
import { getSettings, updateSettings } from '../controllers/settingsController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import pool from '../config/db.js'
import { success, error } from '../utils/response.js'

const router = Router()

// Public: get settings (used by frontend for delivery fee, etc.)
router.get('/', getSettings)

// Public: get FAQ categories from settings
router.get('/faq', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT value FROM business_settings WHERE key = 'faq_categories'`
    )
    if (result.rows.length > 0) {
      const val = result.rows[0].value
      return success(res, Array.isArray(val) ? val : (typeof val === 'string' ? JSON.parse(val) : []))
    }
    return success(res, [])
  } catch (err) {
    console.error('FAQ fetch error:', err.message)
    return success(res, [])
  }
})

// Admin only: update settings
router.put('/', requireAuth, requireAdmin, updateSettings)

export default router

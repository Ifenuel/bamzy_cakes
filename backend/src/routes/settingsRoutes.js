import { Router } from 'express'
import { getSettings, updateSettings } from '../controllers/settingsController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Public: get settings (used by frontend for delivery fee, etc.)
router.get('/', getSettings)

// Admin only: update settings
router.put('/', requireAuth, requireAdmin, updateSettings)

export default router

import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import * as customerController from '../controllers/customerController.js'

const router = Router()

router.get('/', requireAuth, customerController.getAccount)
router.put('/', requireAuth, customerController.updateAccount)
router.delete('/', requireAuth, customerController.deleteAccount)
router.get('/notifications', requireAuth, customerController.getNotifications)
router.put('/notifications/:id/read', requireAuth, customerController.markNotificationRead)
router.put('/notifications/read-all', requireAuth, customerController.markAllNotificationsRead)

export default router

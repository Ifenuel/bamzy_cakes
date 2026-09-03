import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import * as adminController from '../controllers/adminController.js'
import * as customerController from '../controllers/customerController.js'

const router = Router()

router.get('/dashboard', requireAdmin, adminController.getDashboard)
router.get('/customers', requireAdmin, customerController.getCustomers)

export default router

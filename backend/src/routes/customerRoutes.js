import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import * as customerController from '../controllers/customerController.js'

const router = Router()

router.get('/', requireAuth, customerController.getAccount)
router.put('/', requireAuth, customerController.updateAccount)

export default router

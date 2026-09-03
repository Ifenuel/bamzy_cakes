import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import * as trainingController from '../controllers/trainingController.js'

const router = Router()

// Public
router.get('/', trainingController.getTrainings)
router.get('/:id', trainingController.getTraining)
router.post('/:id/register', trainingController.registerForTraining)

// Admin
router.post('/', requireAdmin, trainingController.createTraining)
router.put('/:id', requireAdmin, trainingController.updateTraining)
router.delete('/:id', requireAdmin, trainingController.deleteTraining)

export default router

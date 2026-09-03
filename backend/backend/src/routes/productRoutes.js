import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import * as productController from '../controllers/productController.js'

const router = Router()

// Public routes
router.get('/', productController.getProducts)
router.get('/categories', productController.getCategories)
router.get('/slug/:slug', productController.getProductBySlug)
router.get('/:id', productController.getProduct)

// Admin: Category management
router.post('/categories', requireAdmin, productController.createCategory)
router.put('/categories/:id', requireAdmin, productController.updateCategory)
router.delete('/categories/:id', requireAdmin, productController.deleteCategory)

// Admin: Product management
router.post('/', requireAdmin, productController.createProduct)
router.put('/:id', requireAdmin, productController.updateProduct)
router.delete('/:id', requireAdmin, productController.deleteProduct)

export default router

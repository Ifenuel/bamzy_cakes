import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../config/db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { success, error, notFound } from '../utils/response.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '../../uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(UPLOAD_DIR, 'products')),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  cb(null, allowed.includes(file.mimetype))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })

const router = Router()

// Public: Get all images for a product
router.get('/:productId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, image_url as "imageUrl", is_primary as "isPrimary", sort_order as "sortOrder" FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [req.params.productId]
    )
    return success(res, result.rows)
  } catch (err) {
    return error(res, 'Failed to load product images', 500)
  }
})

// Admin: Upload an image for a product
router.post('/:productId', requireAdmin, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return error(res, err.message || 'Upload failed', 400)
    if (!req.file) return error(res, 'No image file provided', 400)

    const imageUrl = `/uploads/products/${req.file.filename}`
    const { productId } = req.params

    try {
      // Check if this is the first image — if so, make it primary
      const existing = await pool.query('SELECT COUNT(*) FROM product_images WHERE product_id = $1', [productId])
      const isFirst = parseInt(existing.rows[0].count) === 0

      const result = await pool.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
         VALUES ($1, $2, $3, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM product_images WHERE product_id = $1))
         RETURNING id, image_url as "imageUrl", is_primary as "isPrimary", sort_order as "sortOrder"`,
        [productId, imageUrl, isFirst]
      )

      // Also update the product's main image_url if this is the first image
      if (isFirst) {
        await pool.query('UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2 AND (image_url IS NULL = true)', [imageUrl, productId])
      }

      return success(res, result.rows[0], 201)
    } catch (err) {
      return error(res, 'Failed to save image', 500)
    }
  })
})

// Admin: Set an image as primary
router.patch('/:productId/:imageId/primary', requireAdmin, async (req, res) => {
  try {
    const { productId, imageId } = req.params
    // Remove primary from all images for this product
    await pool.query('UPDATE product_images SET is_primary = false WHERE product_id = $1', [productId])
    // Set the selected one as primary
    await pool.query('UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2', [imageId, productId])
    // Also update the product's main image_url
    const img = await pool.query('SELECT image_url FROM product_images WHERE id = $1', [imageId])
    if (img.rows.length > 0) {
      await pool.query('UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2', [img.rows[0].image_url, productId])
    }
    return success(res, { message: 'Primary image updated' })
  } catch (err) {
    return error(res, 'Failed to update primary image', 500)
  }
})

// Admin: Delete a product image
router.delete('/:productId/:imageId', requireAdmin, async (req, res) => {
  try {
    const { productId, imageId } = req.params
    const img = await pool.query('SELECT image_url, is_primary FROM product_images WHERE id = $1 AND product_id = $2', [imageId, productId])
    if (img.rows.length === 0) return notFound(res, 'Image not found')

    await pool.query('DELETE FROM product_images WHERE id = $1', [imageId])

    // If deleted image was primary, set the next one as primary
    if (img.rows[0].is_primary) {
      const next = await pool.query(
        'SELECT id, image_url FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC LIMIT 1',
        [productId]
      )
      if (next.rows.length > 0) {
        await pool.query('UPDATE product_images SET is_primary = true WHERE id = $1', [next.rows[0].id])
        await pool.query('UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2', [next.rows[0].image_url, productId])
      } else {
        // No more images — clear the product's image_url
        await pool.query('UPDATE products SET image_url = NULL, updated_at = NOW() WHERE id = $1', [productId])
      }
    }

    return success(res, { message: 'Image deleted' })
  } catch (err) {
    return error(res, 'Failed to delete image', 500)
  }
})

export default router

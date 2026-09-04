import { Router } from 'express'
import multer from 'multer'
import pool from '../config/db.js'
import { requireAdmin } from '../middleware/auth.js'
import { success, error, notFound } from '../utils/response.js'
import { uploadImage, deleteImage } from '../config/cloudinary.js'

const storage = multer.memoryStorage()

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
router.post('/:productId', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'No image file provided', 400)

    const result = await uploadImage(req.file.buffer, 'products')
    const imageUrl = result.secure_url
    const { productId } = req.params

    const existing = await pool.query('SELECT COUNT(*) FROM product_images WHERE product_id = $1', [productId])
    const isFirst = parseInt(existing.rows[0].count) === 0

    const imgResult = await pool.query(
      `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
       VALUES ($1, $2, $3, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM product_images WHERE product_id = $1))
       RETURNING id, image_url as "imageUrl", is_primary as "isPrimary", sort_order as "sortOrder"`,
      [productId, imageUrl, isFirst]
    )

    if (isFirst) {
      await pool.query('UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2 AND (image_url IS NULL = true)', [imageUrl, productId])
    }

    return success(res, imgResult.rows[0], 201)
  } catch (err) {
    console.error('[ProductImage] Upload failed:', err.message)
    return error(res, 'Failed to save image: ' + err.message, 500)
  }
})

// Admin: Set an image as primary
router.patch('/:productId/:imageId/primary', requireAdmin, async (req, res) => {
  try {
    const { productId, imageId } = req.params
    await pool.query('UPDATE product_images SET is_primary = false WHERE product_id = $1', [productId])
    await pool.query('UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2', [imageId, productId])
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

    if (img.rows[0].is_primary) {
      const next = await pool.query(
        'SELECT id, image_url FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC LIMIT 1',
        [productId]
      )
      if (next.rows.length > 0) {
        await pool.query('UPDATE product_images SET is_primary = true WHERE id = $1', [next.rows[0].id])
        await pool.query('UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2', [next.rows[0].image_url, productId])
      } else {
        await pool.query('UPDATE products SET image_url = NULL, updated_at = NOW() WHERE id = $1', [productId])
      }
    }

    return success(res, { message: 'Image deleted' })
  } catch (err) {
    return error(res, 'Failed to delete image', 500)
  }
})

export default router

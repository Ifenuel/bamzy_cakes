import { Router } from 'express'
import multer from 'multer'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'
import cloudinary from '../config/cloudinary.js'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

// Upload buffer to Cloudinary using SDK's upload_stream
function uploadToCloud(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `bamzy-cakes/${folder}`,
        resource_type: 'image',
      },
      (err, result) => {
        if (err) {
          console.error('[Cloudinary] Upload error:', err.message)
          return reject(err)
        }
        console.log('[Cloudinary] Upload success:', result.secure_url)
        resolve(result)
      }
    )
    stream.end(buffer)
  })
}

const router = Router()

// Upload avatar: POST /api/upload/avatar (any authenticated user)
router.post('/avatar', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'No image file provided', 400)
    const result = await uploadToCloud(req.file.buffer, 'avatars')
    return success(res, { imageUrl: result.secure_url, filename: result.public_id })
  } catch (err) {
    console.error('[Upload] Avatar failed:', err.message)
    return error(res, 'Upload failed: ' + (err.message || 'Unknown error'), 500)
  }
})

// Upload single image: POST /api/upload/:type
// type = 'products', 'trainings', 'brand', 'events'
router.post('/:type', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'No image file provided', 400)

    const type = ['trainings', 'brand', 'events'].includes(req.params.type) ? req.params.type : 'products'
    const result = await uploadToCloud(req.file.buffer, type)

    return success(res, { imageUrl: result.secure_url, filename: result.public_id })
  } catch (err) {
    console.error('[Upload] Failed:', err.message)
    return error(res, 'Upload failed: ' + (err.message || 'Unknown error'), 500)
  }
})

// Delete image from Cloudinary: DELETE /api/upload/:type/:publicId
router.delete('/:type/:publicId', requireAdmin, async (req, res) => {
  try {
    const publicId = `bamzy-cakes/${req.params.type}/${req.params.publicId}`
    await cloudinary.uploader.destroy(publicId)
    return success(res, { message: 'Image deleted' })
  } catch (err) {
    console.error('[Upload] Delete failed:', err.message)
    return error(res, 'Failed to delete image', 500)
  }
})

export default router

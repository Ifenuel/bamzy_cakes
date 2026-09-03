import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { requireAdmin } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '../../uploads')

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type
    const folder = ['trainings', 'brand', 'events'].includes(type) ? type : 'products'
    cb(null, path.join(UPLOAD_DIR, folder))
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  cb(null, allowed.includes(file.mimetype))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }) // 5MB max

const router = Router()

// Upload avatar: POST /api/upload/avatar (any authenticated user)
import { requireAuth } from '../middleware/auth.js'

router.post('/avatar', requireAuth, (req, res) => {
  const avatarUpload = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } })
  avatarUpload.single('image')(req, res, (err) => {
    if (err) return error(res, err.message || 'Upload failed', 400)
    if (!req.file) return error(res, 'No image file provided', 400)
    const imageUrl = `/uploads/products/${req.file.filename}`
    return success(res, { imageUrl, filename: req.file.filename })
  })
})

// Upload single image: POST /api/upload/:type
// type = 'products' or 'trainings'
router.post('/:type', requireAdmin, (req, res) => {
  const uploadSingle = upload.single('image')

  uploadSingle(req, res, (err) => {
    if (err) {
      return error(res, err.message || 'Upload failed', 400)
    }
    if (!req.file) {
      return error(res, 'No image file provided', 400)
    }

    const type = ['trainings', 'brand', 'events'].includes(req.params.type) ? req.params.type : 'products'
    const imageUrl = `/uploads/${type}/${req.file.filename}`

    return success(res, { imageUrl, filename: req.file.filename })
  })
})

export default router

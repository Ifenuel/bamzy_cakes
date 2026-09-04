// Cloudinary REST API helper — signature-based auth (no SDK needed)
// Uses SHA1 signature which is what Cloudinary's upload API expects

import { createHash } from 'crypto'

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('[Cloudinary] Missing credentials!')
} else {
  console.log('[Cloudinary] Configured for cloud:', CLOUD_NAME)
}

/**
 * Generate Cloudinary upload signature
 */
function generateSignature(params) {
  // Sort params alphabetically, skip 'file' and 'api_key'
  const sorted = Object.keys(params)
    .filter(k => k !== 'file' && k !== 'api_key')
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&')

  return createHash('sha1').update(sorted + API_SECRET).digest('hex')
}

/**
 * Upload a buffer to Cloudinary via REST API using signature auth
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - e.g. 'products', 'trainings', 'avatars'
 * @returns {{ secure_url, public_id, width, height }}
 */
export async function uploadImage(buffer, folder) {
  const timestamp = Math.round(Date.now() / 1000)
  const folderPath = `bamzy-cakes/${folder}`

  const params = { folder: folderPath, timestamp }
  const signature = generateSignature(params)

  const formData = new FormData()
  formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg')
  formData.append('folder', folderPath)
  formData.append('timestamp', timestamp)
  formData.append('api_key', API_KEY)
  formData.append('signature', signature)

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  const result = await response.json()

  if (result.error) {
    throw new Error(result.error.message || 'Cloudinary upload failed')
  }

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
  }
}

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - e.g. 'bamzy-cakes/products/abc123'
 */
export async function deleteImage(publicId) {
  const timestamp = Math.round(Date.now() / 1000)

  const params = { public_id: publicId, timestamp }
  const signature = generateSignature(params)

  const formData = new FormData()
  formData.append('public_id', publicId)
  formData.append('timestamp', timestamp)
  formData.append('api_key', API_KEY)
  formData.append('signature', signature)

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  return await response.json()
}

// Cloudinary REST API helper — uses basic auth, no SDK needed
// This bypasses all cloudinary SDK config/signature issues on Railway

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET
const AUTH_HEADER = 'Basic ' + Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('[Cloudinary] Missing credentials!')
} else {
  console.log('[Cloudinary] Configured for cloud:', CLOUD_NAME)
}

/**
 * Upload a buffer to Cloudinary via REST API
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - e.g. 'products', 'trainings', 'avatars'
 * @returns {{ secure_url, public_id, width, height }}
 */
export async function uploadImage(buffer, folder) {
  const blob = new Blob([buffer], { type: 'image/jpeg' })
  const formData = new FormData()
  formData.append('file', blob, 'image.jpg')
  formData.append('folder', `bamzy-cakes/${folder}`)
  formData.append('api_key', API_KEY)

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': AUTH_HEADER },
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
  const formData = new FormData()
  formData.append('public_id', publicId)
  formData.append('api_key', API_KEY)

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': AUTH_HEADER },
    body: formData,
  })

  return await response.json()
}

// Cloudinary config — unsigned upload preset, no SDK needed
// Uses the bamzy_unsigned upload preset created via Cloudinary admin API

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET
const UPLOAD_PRESET = 'bamzy_unsigned'

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('[Cloudinary] Missing credentials!')
} else {
  console.log('[Cloudinary] Configured for cloud:', CLOUD_NAME, '(unsigned uploads)')
}

/**
 * Upload a buffer to Cloudinary via unsigned upload preset
 * No signature needed — the preset handles auth
 */
export async function uploadImage(buffer, folder) {
  const blob = new Blob([buffer], { type: 'image/jpeg' })

  const formData = new FormData()
  formData.append('file', blob, 'image.jpg')
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', `bamzy-cakes/${folder}`)

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const response = await fetch(url, { method: 'POST', body: formData })
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
 * Delete an image from Cloudinary using admin API (basic auth works for destroy)
 */
export async function deleteImage(publicId) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ public_id: publicId }),
  })

  return await response.json()
}

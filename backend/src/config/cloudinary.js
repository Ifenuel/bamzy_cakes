import { v2 as cloudinary } from 'cloudinary'

// Prefer CLOUDINARY_URL if set (Railway may set this), otherwise use individual vars
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL })
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Verify config loaded correctly
const c = cloudinary.config()
if (!c.cloud_name || !c.api_key || !c.api_secret) {
  console.error('[Cloudinary] Config incomplete:', {
    cloud_name: c.cloud_name ? 'set' : 'MISSING',
    api_key: c.api_key ? 'set' : 'MISSING',
    api_secret: c.api_secret ? 'set' : 'MISSING',
  })
}

export default cloudinary

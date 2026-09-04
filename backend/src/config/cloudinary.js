// Cloudinary config — uses the SDK properly
// The SDK handles signature generation, param encoding, and upload_stream correctly

import { v2 as cloudinary } from 'cloudinary'

// Explicitly configure — don't rely on CLOUDINARY_URL auto-detection
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
})

// Verify config
const cfg = cloudinary.config()
console.log('[Cloudinary] Configured:', {
  cloud: cfg.cloud_name,
  key: cfg.api_key ? cfg.api_key.slice(-4) : 'MISSING',
  secret: cfg.api_secret ? cfg.api_secret.slice(-4) : 'MISSING',
})

export default cloudinary

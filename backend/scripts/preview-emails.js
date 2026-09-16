#!/usr/bin/env node
/**
 * DEV-ONLY email template previewer.
 *
 * Renders every Bamzy email template to ./email-previews/*.html so you can
 * open them in a browser and check contrast, layout, logo, buttons and
 * dynamic content — WITHOUT sending anything through Brevo.
 *
 * Usage:
 *   cd backend
 *   node scripts/preview-emails.js
 *   start email-previews/welcome.html   (or just open the folder)
 *
 * This script is never imported by the server; it only imports the template
 * module. Sending functions are stubbed out so NOTHING can be sent by accident.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'email-previews')

// Hard safety: run with a fake API key so even an accidental send() would
// fail against Brevo rather than touching real infrastructure.
process.env.BREVO_API_KEY = process.env.BREVO_API_KEY || 'dev-preview-only-key'

const emailService = await import('../src/services/emailService.js')

// Stub the Brevo client by intercepting sendTransacEmail at module level.
// Simpler approach: temporarily monkey-patch via class prototype is fragile —
// instead we call the template builders through the public functions with a
// stubbed client. The service caches one client instance, so we patch it.
// (No network call will succeed because the API key above is invalid AND we
//  intercept the client's sendTransacEmail method.)

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // Intercept the Brevo client's send method so templates render offline.
  // `transactionalEmails` is getter-only, so we patch the PROTOTYPE of the
  // underlying API class — every instance (fresh or cached) then routes
  // through our capture instead of the network.
  const { BrevoClient } = await import('@getbrevo/brevo')
  const captured = []
  const probe = new BrevoClient({ auth: { apiKey: 'preview-probe' } })
  const apiProto = Object.getPrototypeOf(probe.transactionalEmails)
  apiProto.sendTransacEmail = function (request) {
    captured.push(request)
    return Promise.resolve({})
  }

  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')

  // ── Render every template with realistic sample data ──
  await emailService.sendOtpEmail('sample@example.com', '482913', 'Adaeze')
  const otpHtml = captured.at(-1)

  await emailService.sendWelcomeEmail('sample@example.com', 'Adaeze')
  const welcomeHtml = captured.at(-1)

  await emailService.sendPasswordResetEmail('sample@example.com', `${process.env.CLIENT_URL || 'https://bamzy-cakes.vercel.app'}/reset-password?token=sample-token`, 'Adaeze')
  const resetHtml = captured.at(-1)

  await emailService.sendOrderConfirmation('sample@example.com', {
    orderNumber: 'BAM-100042',
    customer_name: 'Adaeze Okafor',
    delivery_method: 'delivery',
    delivery_address: '12 Admiralty Way',
    delivery_city: 'Lekki',
    delivery_state: 'Lagos',
    subtotal: 25500,
    delivery_fee: 2500,
    total: 28000,
    items: [
      { product_name: 'Vanilla Celebration Cake', quantity: 1, unit_price: 18000, total_price: 18000 },
      { product_name: 'Chocolate Chip Cookies (Box of 10)', quantity: 3, unit_price: 2500, total_price: 7500 },
    ],
  })
  const orderHtml = captured.at(-1)

  await emailService.sendLoginNotification('sample@example.com', 'Adaeze', '102.89.44.12')
  const loginHtml = captured.at(-1)

  await emailService.sendContactMessage({
    name: 'Adaeze Okafor',
    email: 'adaeze@example.com',
    phone: '08012345678',
    subject: 'Wedding cake enquiry',
    message: 'Hello! I would like a quote for a 3-tier wedding cake for 250 guests in December.\nThanks!',
  })
  const contactHtml = captured.at(-1)

  await emailService.sendNewsletter({
    subject: 'December Baking Class — Registration Open!',
    message:
      'Our December training cohort is now open for registration.\n\n' +
      'Learn fondant, buttercream and pastry arts from Bamzy chefs over 4 weekends.\n\n' +
      'Early-bird pricing ends soon — reserve your seat today!',
    subscriberEmails: ['sample@example.com'],
  })
  const newsletterHtml = captured.at(-1)

  const files = [
    ['otp-verification', otpHtml],
    ['welcome', welcomeHtml],
    ['password-reset', resetHtml],
    ['order-confirmation', orderHtml],
    ['login-alert', loginHtml],
    ['contact-message', contactHtml],
    ['newsletter', newsletterHtml],
  ]

  // Index page linking all templates
  const index = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bamzy Email Previews (DEV ONLY)</title>
<style>body{font-family:sans-serif;max-width:720px;margin:40px auto;padding:0 16px;color:#111}h1{color:#7C3AED}li{margin:8px 0}a{color:#DB2777}</style></head>
<body><h1>🎂 Bamzy Email Previews</h1><p>Dev-only renders generated ${now}. Nothing was sent.</p><ul>
${files.map(([name]) => `<li><a href="./${name}.html">${name}</a></li>`).join('\n')}
</ul></body></html>`

  for (const [name, req] of files) {
    if (!req?.htmlContent) {
      console.warn(`  ! ${name}: no content captured (skipped)`)
      continue
    }
    fs.writeFileSync(path.join(OUT_DIR, `${name}.html`), req.htmlContent, 'utf8')
    console.log(`  ✓ ${name}.html`)
  }
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), index, 'utf8')
  console.log(`\nDone. Open email-previews/index.html in a browser to review all templates.`)
  console.log('Contrast checklist: headings #111827, body #4B5563, white text only on flat purple header & dark footer.')
}

main().catch((err) => {
  console.error('Preview failed:', err)
  process.exit(1)
})

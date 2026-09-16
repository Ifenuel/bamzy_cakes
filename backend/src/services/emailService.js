import { BrevoClient } from '@getbrevo/brevo'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'bamzycakes621@gmail.com'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Bamzy Cakes & Confectionery'
const CLIENT_URL = process.env.CLIENT_URL || 'https://bamzy-cakes.vercel.app'

// Email-safe logo: a plain public HTTPS URL on Cloudinary.
// Gmail and Apple Mail STRIP data: URIs (base64-embedded images), which is
// why the logo previously rendered as a broken image box in received email.
// Cloudinary serves this file publicly with correct Content-Type and no auth.
const LOGO_URL = process.env.EMAIL_LOGO_URL || "https://res.cloudinary.com/pqgyfjto/image/upload/bamzy-cakes/branding/bamzy-logo.jpg"

let client = null

function getBrevoClient() {
  if (!client) {
    client = new BrevoClient({ auth: { apiKey: BREVO_API_KEY } })
  }
  return client
}

/* ═══════════════════════════════════════════════════════════════════
   BAMZY EMAIL DESIGN SYSTEM
   ─────────────────────────────────────────────────────────────────
   One consistent, table-based, email-client-safe system used by every
   Bamzy email. Core rules:

   1. READABILITY FIRST. Dark text on light surfaces, white text only on
      sufficiently dark brand surfaces. Every pairing below passes
      WCAG AA (≥4.5:1 body, ≥3:1 large/bold text):
        - headings/body   #111827 / #4B5563 on white or #FAF5FF
        - labels          #6B7280 on white / #FAF5FF
        - brand actions   #DB2777 (deep pink) text-on-white ≥ 4.5:1
        - header band     white on flat #7C3AED (≈6.7:1)
        - footer          #C4B5FD / #B3A2C7 on #2A1B3D (≥4.5:1)
   2. FLAT BRAND COLOR BLOCKS — no text sits on gradients (Outlook and
      Gmail apps mangle gradient backgrounds; this was the root cause of
      the old "near-invisible heading" problem).
   3. TABLE-BASED LAYOUT with inline styles only — no external CSS, no
      flex/grid, no JS. Tables render reliably in Gmail, Apple Mail and
      Outlook (where supported).
   4. Max width 600px, fluid on mobile via width:100%.
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  headerBg: '#7C3AED',   // brand purple — flat block, white text passes AA
  headerSub: '#E9D5FF',  // lavender subtitle on purple ≈4.9:1
  ink: '#111827',        // headings
  body: '#4B5563',       // body copy ≈7.6:1 on white
  muted: '#6B7280',      // labels ≈4.8:1 on white
  pink: '#DB2777',       // deep pink — 4.6:1 on white (old #F04B8A was 3.2:1)
  purpleDeep: '#6D28D9',
  cardBg: '#FAF5FF',     // soft lilac card
  cardBorder: '#EDE1F8',
  warnBg: '#FFF5F9',
  warnText: '#9F1239',
  footerBg: '#2A1B3D',
  footerLink: '#C4B5FD',
  footerText: '#B3A2C7',
  pageBg: '#F7F2FB',
  divider: '#EDE1F8',
}

/* ---------- Layout ---------- */

function emailBody(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Bamzy Cakes &amp; Confectionery</title>
</head>
<body style="margin:0;padding:0;background-color:${C.pageBg};font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.pageBg};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:14px;overflow:hidden;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/* ---------- Header / Footer ---------- */

function emailHeader(title, subtitle) {
  return `
  <tr>
    <td style="background-color:${C.headerBg};padding:32px 28px 28px;text-align:center;">
      <img src="${LOGO_URL}" alt="Bamzy Cakes &amp; Confectionery" width="64" height="64" style="display:block;margin:0 auto 12px;border-radius:12px;border:3px solid rgba(255,255,255,0.35);" />
      <h1 style="color:#ffffff;font-size:24px;line-height:1.25;margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:700;">${title}</h1>
      ${subtitle ? `<p style="color:${C.headerSub};font-size:12px;margin:8px 0 0;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">${subtitle}</p>` : ''}
    </td>
  </tr>`
}

function emailFooter() {
  return `
  <tr>
    <td style="background-color:${C.footerBg};padding:26px 28px;text-align:center;">
      <p style="color:#ffffff;font-size:13px;margin:0 0 4px;font-weight:600;">
        Bamzy Cakes &amp; Confectionery
      </p>
      <p style="color:${C.footerLink};font-size:11px;margin:0 0 14px;">
        Ibadan &amp; Southwest Nigeria &bull; Cakes, Events &amp; Training
      </p>
      <p style="margin:0 0 14px;">
        <a href="https://instagram.com/bamzycakes" style="color:${C.footerLink};text-decoration:none;font-size:12px;margin:0 6px;">Instagram</a>
        &bull;
        <a href="https://wa.me/2347033374470" style="color:${C.footerLink};text-decoration:none;font-size:12px;margin:0 6px;">WhatsApp</a>
      </p>
      <p style="margin:0 0 10px;">
        <a href="${CLIENT_URL}/privacy-policy" style="color:${C.footerLink};text-decoration:none;font-size:11px;margin:0 4px;">Privacy Policy</a>
        &bull;
        <a href="${CLIENT_URL}/terms" style="color:${C.footerLink};text-decoration:none;font-size:11px;margin:0 4px;">Terms &amp; Conditions</a>
        &bull;
        <a href="${CLIENT_URL}/contact" style="color:${C.footerLink};text-decoration:none;font-size:11px;margin:0 4px;">Contact</a>
      </p>
      <p style="color:${C.footerText};font-size:10px;margin:0;line-height:1.6;">
        &copy; ${new Date().getFullYear()} Bamzy Cakes &amp; Confectionery. All rights reserved.
      </p>
    </td>
  </tr>`
}

/* ---------- Shared components ---------- */

function greeting(name) {
  return `<p style="color:${C.ink};font-size:16px;line-height:1.6;margin:0 0 8px;font-weight:600;">
    Hi ${name || 'there'} 👋
  </p>`
}

function paragraph(text, extra = '') {
  return `<p style="color:${C.body};font-size:15px;line-height:1.7;margin:0 0 24px;${extra}">${text}</p>`
}

function button(href, label) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
    <tr>
      <td align="center">
        <a href="${href}" style="display:inline-block;background-color:${C.pink};color:#ffffff;text-decoration:none;padding:15px 42px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.3px;">${label}</a>
      </td>
    </tr>
  </table>`
}

// Info card: label/value rows (order info, login info, contact info...)
function infoCard(rows) {
  const cells = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:6px 0;font-size:12px;color:${C.muted};">${label}</td>
        <td style="padding:6px 0;font-size:14px;font-weight:600;color:${C.ink};text-align:right;">${value}</td>
      </tr>`
    )
    .join('')
  return `<div style="background-color:${C.cardBg};border:1px solid ${C.cardBorder};border-radius:12px;padding:18px 20px;margin:0 0 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cells}</table>
  </div>`
}

function warningBox(html) {
  return `<div style="background-color:${C.warnBg};border-left:4px solid ${C.pink};border-radius:0 10px 10px 0;padding:14px 18px;margin:0 0 24px;">
    <p style="color:${C.warnText};font-size:13px;margin:0;line-height:1.6;">${html}</p>
  </div>`
}

function divider() {
  return `<hr style="border:none;border-top:1px solid ${C.divider};margin:28px 0;">`
}

/* ═══════════════════════════════════════════════════════
   TEMPLATES
   ═══════════════════════════════════════════════════════ */

/**
 * Send a professional OTP verification email
 */
export async function sendOtpEmail(toEmail, otpCode, userName) {
  const brevo = getBrevoClient()

  const htmlContent = emailBody(`
    ${emailHeader('Verify Your Email', 'One quick step')}

    <tr>
      <td style="padding:36px 32px;">
        ${greeting(userName)}
        ${paragraph('Thank you for joining Bamzy Cakes &amp; Confectionery! Please use the verification code below to complete your registration:')}

        <div style="background-color:${C.cardBg};border:2px dashed #A78BFA;border-radius:12px;padding:26px 20px;text-align:center;margin:0 0 24px;">
          <p style="color:${C.muted};font-size:11px;margin:0 0 10px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Verification Code</p>
          <p style="color:${C.purpleDeep};font-size:38px;font-weight:800;letter-spacing:10px;margin:0;font-family:Georgia,'Times New Roman',serif;">${otpCode}</p>
          <p style="color:${C.muted};font-size:12px;margin:14px 0 0;">This code expires in <strong style="color:${C.purpleDeep};">10 minutes</strong></p>
        </div>

        ${paragraph('If you did not create an account with Bamzy Cakes, please ignore this email. Your account will not be created until you verify.', 'font-size:13px;color:#6B7280;')}
        ${divider()}
      </td>
    </tr>

    ${emailFooter()}
  `)

  const request = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject: `Your Bamzy Verification Code: ${otpCode}`,
    htmlContent,
    textContent: `Your Bamzy verification code is: ${otpCode}. It expires in 10 minutes.`,
  }

  try {
    await brevo.transactionalEmails.sendTransacEmail(request)
    console.log(`[EMAIL] OTP sent to ${toEmail}`)
    return true
  } catch (err) {
    console.error(`[EMAIL] Failed to send OTP to ${toEmail}:`, err.message || err)
    return false
  }
}

/**
 * Send a professional welcome email after successful registration
 */
export async function sendWelcomeEmail(toEmail, userName) {
  const brevo = getBrevoClient()

  const step = (n, color, title, desc) => `
    <tr>
      <td style="padding:9px 0;vertical-align:top;width:38px;">
        <span style="display:inline-block;width:28px;height:28px;background-color:${color};color:#ffffff;border-radius:8px;text-align:center;line-height:28px;font-size:14px;font-weight:700;">${n}</span>
      </td>
      <td style="padding:9px 0;vertical-align:top;">
        <p style="color:${C.ink};font-size:14px;margin:0 0 2px;font-weight:600;">${title}</p>
        <p style="color:${C.muted};font-size:13px;margin:0;line-height:1.5;">${desc}</p>
      </td>
    </tr>`

  const htmlContent = emailBody(`
    ${emailHeader('Welcome to the Family!', 'Your Bamzy journey begins')}

    <tr>
      <td style="padding:36px 32px;">
        ${greeting(userName + ' 🎉')}
        ${paragraph("Welcome to the Bamzy family! Your account is all set. Here's what you can do from your personal dashboard:")}

        <div style="background-color:${C.cardBg};border:1px solid ${C.cardBorder};border-radius:12px;padding:16px 20px;margin:0 0 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${step('1', C.headerBg, 'Browse &amp; Order Fresh Treats', 'Cakes, pastries, small chops, and more — delivered to your door.')}
            ${step('2', '#A78BFA', 'Book Events &amp; Catering', 'Weddings, birthdays, corporate events — we handle the sweets.')}
            ${step('3', C.pink, 'Join Baking Training', "Learn the art of baking from Bamzy's expert chefs.")}
            ${step('4', '#059669', 'Track Every Order', 'Real-time updates on preparation, delivery, and status.')}
          </table>
        </div>

        ${button(`${CLIENT_URL}/shop`, 'Start Shopping →')}

        ${paragraph(`Need help? Just reply to this email or reach us on <a href="https://wa.me/2347033374470" style="color:${C.purpleDeep};font-weight:600;text-decoration:none;">WhatsApp</a>. We're always here for you!`, 'font-size:13px;color:#6B7280;')}
        ${divider()}
      </td>
    </tr>

    ${emailFooter()}
  `)

  const request = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject: `Welcome to Bamzy, ${userName || 'Sweet'}! 🎉`,
    htmlContent,
    textContent: `Welcome to Bamzy Cakes & Confectionery, ${userName}! Your account is ready. Start shopping: ${CLIENT_URL}/shop`,
  }

  try {
    await brevo.transactionalEmails.sendTransacEmail(request)
    console.log(`[EMAIL] Welcome email sent to ${toEmail}`)
    return true
  } catch (err) {
    console.error(`[EMAIL] Failed to send welcome email to ${toEmail}:`, err.message || err)
    return false
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(toEmail, resetLink, userName) {
  const brevo = getBrevoClient()

  const htmlContent = emailBody(`
    ${emailHeader('Password Reset', 'Secure your account')}

    <tr>
      <td style="padding:36px 32px;">
        ${greeting(userName)}
        ${paragraph('We received a request to reset your Bamzy account password. Tap the button below to create a new one:')}

        ${button(resetLink, 'Reset My Password')}

        ${warningBox('⏰ This link expires in <strong>5 minutes</strong>. If you didn\'t request this, please ignore this email — your password will remain unchanged.')}

        ${paragraph('For your security, never share this link with anyone.', 'font-size:12px;color:#6B7280;')}
        ${divider()}
      </td>
    </tr>

    ${emailFooter()}
  `)

  const request = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject: 'Reset Your Bamzy Password',
    htmlContent,
    textContent: `Reset your Bamzy password: ${resetLink} (expires in 5 minutes). If you didn't request this, ignore this email.`,
  }

  try {
    await brevo.transactionalEmails.sendTransacEmail(request)
    console.log(`[EMAIL] Password reset sent to ${toEmail}`)
    return true
  } catch (err) {
    console.error(`[EMAIL] Failed to send password reset to ${toEmail}:`, err.message || err)
    return false
  }
}

/**
 * Sync a contact to Brevo (for newsletter)
 */
export async function upsertContact({ email, name }) {
  const brevo = getBrevoClient()
  try {
    await brevo.contacts.createContact({
      email,
      listIds: [2], // Default newsletter list
      attributes: { FULLNAME: name || '' },
    })
    console.log(`[BREVO] Contact synced: ${email}`)
    return true
  } catch (err) {
    console.error(`[BREVO] Failed to sync contact ${email}:`, err.message || err)
    return false
  }
}

/**
 * Remove a contact from Brevo
 */
export async function removeContact(email) {
  const brevo = getBrevoClient()
  try {
    await brevo.contacts.deleteContact(email)
    return true
  } catch (err) {
    console.error(`[BREVO] Failed to remove contact:`, err.message || err)
    return false
  }
}

/**
 * Send newsletter to all subscribers via Brevo
 */
export async function sendNewsletter({ subject, message, subscriberEmails }) {
  const brevo = getBrevoClient()
  let sent = 0
  let failed = 0

  function buildNewsletterHtml(subscriberEmail) {
    const unsubscribeUrl = `${CLIENT_URL}/newsletter/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`
    return emailBody(`
      ${emailHeader('Newsletter', 'From the Bamzy Kitchen')}

      <tr>
        <td style="padding:36px 32px;">
          <h2 style="color:${C.ink};font-size:21px;margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;line-height:1.3;">${subject}</h2>
          <div style="color:${C.body};font-size:15px;line-height:1.8;">${message.replace(/\n/g, '<br>')}</div>

          ${divider()}

          <p style="color:${C.muted};font-size:12px;text-align:center;margin:0;">
            You're receiving this because you subscribed to Bamzy's newsletter.<br>
            <a href="${unsubscribeUrl}" style="color:${C.purpleDeep};text-decoration:none;font-weight:600;">Unsubscribe</a>
          </p>
        </td>
      </tr>

      ${emailFooter()}
    `)
  }

  for (const email of subscriberEmails) {
    const request = {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email }],
      subject,
      htmlContent: buildNewsletterHtml(email),
      textContent: `${subject}\n\n${message}`,
    }

    try {
      await brevo.transactionalEmails.sendTransacEmail(request)
      sent++
    } catch (err) {
      console.error(`[EMAIL] Newsletter failed for ${email}:`, err.message || err)
      failed++
    }
  }

  console.log(`[EMAIL] Newsletter: ${sent} sent, ${failed} failed out of ${subscriberEmails.length}`)
  return { sent, failed, total: subscriberEmails.length }
}

/**
 * Send order confirmation email after successful payment
 */
export async function sendOrderConfirmation(toEmail, order) {
  if (!toEmail || !BREVO_API_KEY) return
  const brevo = getBrevoClient()

  const items = (order.items || []).map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${C.divider};">
        <p style="margin:0;font-size:14px;font-weight:600;color:${C.ink};">${item.product_name || item.name || 'Product'}</p>
        <p style="margin:3px 0 0;font-size:12px;color:${C.muted};">Qty: ${item.quantity} × ₦${Number(item.unit_price || item.price || 0).toLocaleString()}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${C.divider};text-align:right;">
        <p style="margin:0;font-size:14px;font-weight:700;color:${C.pink};">₦${Number(item.total_price || item.subtotal || 0).toLocaleString()}</p>
      </td>
    </tr>`).join('')

  const isDelivery = (order.delivery_method || 'delivery') === 'delivery'
  const subtotal = order.subtotal != null ? Number(order.subtotal) : null
  // Accept both snake_case (legacy callers) and camelCase (DB alias) keys.
  const rawDeliveryFee = order.delivery_fee != null ? order.delivery_fee : order.deliveryFee
  const deliveryFee = isDelivery && rawDeliveryFee != null ? Number(rawDeliveryFee) : null

  const htmlContent = emailBody(`
    ${emailHeader('Order Confirmed!', 'Thank you for your order')}

    <tr>
      <td style="padding:36px 32px;">
        ${greeting(order.customer_name || 'Customer')}
        ${paragraph("Your order has been confirmed and payment received. We're preparing your treats with love!")}

        ${infoCard([
          ['Order Number', `#${order.orderNumber || order.id?.slice(0, 8) || ''}`],
          ['Delivery Method', isDelivery ? 'Delivery' : 'Pickup'],
          ...(isDelivery && order.delivery_address
            ? [['Delivery Address', `${order.delivery_address}${order.delivery_city ? ', ' + order.delivery_city : ''}${order.delivery_state ? ', ' + order.delivery_state : ''}`]]
            : []),
        ])}

        <p style="color:${C.ink};font-size:13px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;">Order Items</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
          ${items}
        </table>

        <div style="border-top:2px solid ${C.divider};padding-top:14px;margin-top:6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${subtotal != null ? `
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${C.body};">Subtotal</td>
              <td style="padding:4px 0;font-size:13px;font-weight:600;color:${C.ink};text-align:right;">₦${subtotal.toLocaleString()}</td>
            </tr>` : ''}
            ${deliveryFee != null ? `
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${C.body};">Delivery</td>
              <td style="padding:4px 0;font-size:13px;font-weight:600;color:${C.ink};text-align:right;">₦${deliveryFee.toLocaleString()}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:8px 0 0;font-size:15px;font-weight:700;color:${C.ink};">Total Paid</td>
              <td style="padding:8px 0 0;font-size:20px;font-weight:800;color:${C.pink};text-align:right;">₦${Number(order.total || 0).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        ${paragraph("We'll notify you when your order is on the way. You can track everything from your <a href=\"" + CLIENT_URL + "/account\" style=\"color:" + C.purpleDeep + ";font-weight:600;text-decoration:none;\">Bamzy dashboard</a>.", 'font-size:13px;color:#6B7280;margin-top:22px;')}
        ${divider()}
      </td>
    </tr>

    ${emailFooter()}
  `)

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail }],
      subject: `Order Confirmed — #${order.orderNumber || order.id?.slice(0, 8) || ''} | Bamzy Cakes`,
      htmlContent,
    })
    console.log(`[EMAIL] Order confirmation sent to ${toEmail}`)
  } catch (err) {
    console.error(`[EMAIL] Order confirmation failed:`, err.message || err)
  }
}

/**
 * Send contact form message to the business owner
 */
export async function sendContactMessage({ name, email, phone, subject, message }) {
  if (!BREVO_API_KEY) return false
  const brevo = getBrevoClient()

  const htmlContent = emailBody(`
    ${emailHeader('New Contact Message', 'From your website')}

    <tr>
      <td style="padding:36px 32px;">
        ${infoCard([
          ['From', name || '—'],
          ['Email', email || 'Not provided'],
          ['Phone', phone || 'Not provided'],
          ['Subject', subject || 'General Enquiry'],
        ])}

        <p style="color:${C.ink};font-size:13px;font-weight:700;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;">Message</p>
        <div style="background-color:#ffffff;border:1px solid ${C.cardBorder};border-radius:12px;padding:18px 20px;">
          <p style="font-size:14px;color:${C.body};line-height:1.8;margin:0;">${message.replace(/\n/g, '<br>')}</p>
        </div>

        ${divider()}
      </td>
    </tr>

    ${emailFooter()}
  `)

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: SENDER_EMAIL }],
      replyTo: { email: email || SENDER_EMAIL, name },
      subject: `[Bamzy Contact] ${subject || 'General Enquiry'} — from ${name}`,
      htmlContent,
      textContent: `New contact message from ${name} (${email || 'no email'}):\n\n${message}`,
    })
    console.log(`[EMAIL] Contact message received from ${name} (${email})`)
    return true
  } catch (err) {
    console.error(`[EMAIL] Contact form email failed:`, err.message || err)
    return false
  }
}

/**
 * Send login notification email to account owner
 */
export async function sendLoginNotification(toEmail, userName, ipAddress) {
  if (!BREVO_API_KEY) return false
  const brevo = getBrevoClient()
  const now = new Date()
  const timeStr = now.toLocaleString('en-NG', { timeZone: 'Africa/Lagos', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const htmlContent = emailBody(`
    ${emailHeader('Login Alert', 'Security notification')}

    <tr>
      <td style="padding:36px 32px;">
        <h2 style="color:${C.ink};font-size:20px;margin:0 0 14px;">New Login Detected</h2>
        ${paragraph(`Hi ${userName || 'there'}, we noticed a new login to your Bamzy account:`)}

        ${infoCard([
          ['Account', toEmail],
          ['Time', timeStr],
          ['IP Address', ipAddress || 'Unknown'],
        ])}

        ${warningBox('<strong>Was this you?</strong> If you did not log in, please change your password immediately or contact our support team.')}

        ${divider()}
      </td>
    </tr>

    ${emailFooter()}
  `)

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail }],
      subject: `Login Alert — New sign-in to your Bamzy account`,
      htmlContent,
      textContent: `New login detected on your Bamzy account at ${timeStr}. IP: ${ipAddress || 'Unknown'}. If this was not you, change your password immediately.`,
    })
    console.log(`[EMAIL] Login notification sent to ${toEmail}`)
  } catch (err) {
    console.error(`[EMAIL] Login notification failed:`, err.message || err)
  }
}

/**
 * Check Brevo connection status
 */
export async function checkBrevoStatus() {
  return {
    configured: !!BREVO_API_KEY,
    senderEmail: SENDER_EMAIL,
    senderName: SENDER_NAME,
  }
}

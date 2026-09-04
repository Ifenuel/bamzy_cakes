import { BrevoClient } from '@getbrevo/brevo'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'bamzycakes621@gmail.com'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Bamzy Cakes & Confectionery'
const CLIENT_URL = process.env.CLIENT_URL || 'https://bamzy-cakes.vercel.app'
const LOGO_URL = `${CLIENT_URL}/logo.jpg`

let client = null

function getBrevoClient() {
  if (!client) {
    client = new BrevoClient({ auth: { apiKey: BREVO_API_KEY } })
  }
  return client
}

/**
 * Send a professional OTP verification email
 */
export async function sendOtpEmail(toEmail, otpCode, userName) {
  const brevo = getBrevoClient()

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F8F4FD;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4FD;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(111,74,168,0.12);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#A97BD6 0%,#F04B8A 100%);padding:40px 30px;text-align:center;">
              <img src="${LOGO_URL}" alt="Bamzy Cakes" width="60" height="60" style="border-radius:50%;border:3px solid rgba(255,255,255,0.3);margin-bottom:12px;" />
              <h1 style="color:#ffffff;font-size:28px;margin:0;font-family:Georgia,serif;">Bamzy Cakes</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase;">&amp; Confectionery</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#24172F;font-size:22px;margin:0 0 10px;">Welcome to Bamzy 💗</h2>
              <p style="color:#756B7E;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hi ${userName || 'there'},
              </p>
              <p style="color:#756B7E;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Thank you for creating a Bamzy account! To complete your registration, please use the verification code below:
              </p>

              <!-- OTP Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background:linear-gradient(135deg,#F8F4FD 0%,#FFF5F9 100%);border:2px dashed #EDE1F8;border-radius:12px;padding:24px;text-align:center;">
                    <p style="color:#756B7E;font-size:12px;margin:0 0 8px;letter-spacing:1px;text-transform:uppercase;">Your Verification Code</p>
                    <p style="color:#6F4AA8;font-size:36px;font-weight:bold;letter-spacing:8px;margin:0;font-family:Georgia,serif;">${otpCode}</p>
                    <p style="color:#A39BA9;font-size:12px;margin:12px 0 0;">This code expires in 10 minutes</p>
                  </td>
                </tr>
              </table>

              <p style="color:#756B7E;font-size:14px;line-height:1.6;margin:0 0 16px;">
                If you did not create an account with Bamzy Cakes &amp; Confectionery, please ignore this email. Your account will not be created until you verify your email.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #EDE1F8;margin:24px 0;">

              <!-- Footer -->
              <p style="color:#A39BA9;font-size:12px;text-align:center;margin:0;">
                Bamzy Cakes &amp; Confectionery &bull; Ibadan, Nigeria<br>
                <a href="https://instagram.com/bamzycakes" style="color:#A97BD6;text-decoration:none;">Instagram</a> &bull;
                <a href="https://wa.me/2347033374470" style="color:#A97BD6;text-decoration:none;">WhatsApp</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

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

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F8F4FD;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4FD;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(111,74,168,0.12);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#A97BD6 0%,#F04B8A 100%);padding:40px 30px;text-align:center;">
              <h1 style="color:#ffffff;font-size:28px;margin:0;font-family:Georgia,serif;">Bamzy Cakes</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase;">&amp; Confectionery</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#24172F;font-size:22px;margin:0 0 10px;">You're In! 🎉</h2>
              <p style="color:#756B7E;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hi ${userName || 'there'},
              </p>
              <p style="color:#756B7E;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Welcome to the Bamzy family! Your account has been created and your email has been verified. You're all set to explore our delicious treats.
              </p>

              <!-- What You Can Do -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background:linear-gradient(135deg,#F8F4FD 0%,#FFF5F9 100%);border-radius:12px;padding:24px;">
                    <h3 style="color:#24172F;font-size:16px;margin:0 0 16px;">Here's what you can do:</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;vertical-align:top;">
                          <span style="color:#F04B8A;font-size:16px;">🧁</span>
                          <span style="color:#24172F;font-size:14px;margin-left:8px;">Browse and order our freshly baked treats</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;vertical-align:top;">
                          <span style="color:#F04B8A;font-size:16px;">🎂</span>
                          <span style="color:#24172F;font-size:14px;margin-left:8px;">Book Bamzy for your next event or celebration</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;vertical-align:top;">
                          <span style="color:#F04B8A;font-size:16px;">📚</span>
                          <span style="color:#24172F;font-size:14px;margin-left:8px;">Register for hands-on baking training classes</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;vertical-align:top;">
                          <span style="color:#F04B8A;font-size:16px;">💗</span>
                          <span style="color:#24172F;font-size:14px;margin-left:8px;">Track all your orders and bookings in one place</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <a href="${CLIENT_URL}/shop" style="display:inline-block;background:linear-gradient(135deg,#A97BD6 0%,#F04B8A 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                      Start Shopping
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#756B7E;font-size:14px;line-height:1.6;margin:0 0 16px;">
                If you ever need help, just reply to this email or reach us on <a href="https://wa.me/2347033374470" style="color:#A97BD6;">WhatsApp</a>. We're always here for you!
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #EDE1F8;margin:24px 0;">

              <!-- Footer -->
              <p style="color:#A39BA9;font-size:12px;text-align:center;margin:0;">
                With love from Bamzy 💗<br>
                Bamzy Cakes &amp; Confectionery &bull; Ibadan, Nigeria<br>
                <a href="https://instagram.com/bamzycakes" style="color:#A97BD6;text-decoration:none;">Instagram</a> &bull;
                <a href="https://wa.me/2347033374470" style="color:#A97BD6;text-decoration:none;">WhatsApp</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const request = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject: `Welcome to Bamzy, ${userName || 'Sweet'}! 🎉`,
    htmlContent,
    textContent: `Welcome to Bamzy Cakes & Confectionery, ${userName}! Your account is ready.`,
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

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#F8F4FD;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4FD;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(111,74,168,0.12);">
        <tr>
          <td style="background:linear-gradient(135deg,#A97BD6 0%,#F04B8A 100%);padding:40px 30px;text-align:center;">
            <img src="${LOGO_URL}" alt="Bamzy Cakes" width="60" height="60" style="border-radius:50%;border:3px solid rgba(255,255,255,0.3);margin-bottom:12px;" />
            <h1 style="color:#ffffff;font-size:26px;margin:0;font-family:Georgia,serif;">Bamzy Cakes</h1>
            <p style="color:rgba(255,255,255,0.85);font-size:11px;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;">&amp; Confectionery</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 30px;">
            <h2 style="color:#24172F;font-size:22px;margin:0 0 16px;">Password Reset Request</h2>
            <p style="color:#756B7E;font-size:15px;line-height:1.6;margin:0 0 24px;">
              Hi ${userName || 'there'}, we received a request to reset your password. Click the button below to set a new one:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td align="center">
              <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#A97BD6 0%,#F04B8A 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                Reset My Password
              </a>
            </td></tr></table>
            <div style="background:#FFF5F9;border-radius:12px;padding:16px;margin:24px 0;">
              <p style="color:#A39BA9;font-size:13px;margin:0;text-align:center;">⏰ This link expires in <strong style="color:#F04B8A;">5 minutes</strong>. If you didn't request this, please ignore this email.</p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const request = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: toEmail }],
    subject: 'Reset Your Bamzy Password',
    htmlContent,
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
    console.error(`[BREVO] Failed to remove contact ${email}:`, err.message || err)
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

  // Build newsletter HTML with a function so each subscriber gets their own unsubscribe link
  function buildNewsletterHtml(subscriberEmail) {
    const unsubscribeUrl = `${CLIENT_URL}/newsletter/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`
    return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#F8F4FD;font-family:'Segoe UI',Tahoma,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4FD;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(111,74,168,0.12);">
        <tr>
          <td style="background:linear-gradient(135deg,#A97BD6 0%,#F04B8A 100%);padding:30px;text-align:center;">
            <img src="${LOGO_URL}" alt="Bamzy Cakes" width="50" height="50" style="border-radius:50%;border:2px solid rgba(255,255,255,0.3);margin-bottom:10px;" />
            <h1 style="color:#ffffff;font-size:24px;margin:0;font-family:Georgia,serif;">Bamzy Cakes</h1>
            <p style="color:rgba(255,255,255,0.85);font-size:11px;margin:4px 0 0;letter-spacing:2px;text-transform:uppercase;">Newsletter</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 30px;">
            <h2 style="color:#24172F;font-size:20px;margin:0 0 16px;">${subject}</h2>
            <div style="color:#756B7E;font-size:15px;line-height:1.7;">${message.replace(/\n/g, '<br>')}</div>
            <hr style="border:none;border-top:1px solid #EDE1F8;margin:30px 0;">
            <p style="color:#A39BA9;font-size:12px;text-align:center;">
              Bamzy Cakes &amp; Confectionery &bull; Ibadan, Nigeria<br>
              <a href="${unsubscribeUrl}" style="color:#A97BD6;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  }

  // Send individually so each subscriber gets a personalized unsubscribe link
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
 * Check Brevo connection status
 */
export async function checkBrevoStatus() {
  return {
    configured: !!BREVO_API_KEY,
    senderEmail: SENDER_EMAIL,
    senderName: SENDER_NAME,
  }
}

/**
 * Send order confirmation email after successful payment
 */
export async function sendOrderConfirmation(toEmail, order) {
  if (!toEmail || !BREVO_API_KEY) return
  const brevo = getBrevoClient()

  const items = (order.items || []).map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F3E8FF;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#1a1025;">${item.product_name || item.name || 'Product'}</p>
        <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">Qty: ${item.quantity} × ₦${Number(item.unit_price || item.price || 0).toLocaleString()}</p>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #F3E8FF;text-align:right;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#F04B8A;">₦${Number(item.total_price || item.subtotal || 0).toLocaleString()}</p>
      </td>
    </tr>`).join('')

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#F8F4FD;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4FD;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(111,74,168,0.12);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#A97BD6 0%,#F04B8A 100%);padding:40px 30px;text-align:center;">
          <img src="${LOGO_URL}" alt="Bamzy Cakes" width="50" height="50" style="border-radius:50%;border:2px solid rgba(255,255,255,0.3);margin-bottom:10px;" />
          <h1 style="color:#ffffff;font-size:28px;margin:0;font-family:Georgia,serif;">Order Confirmed! 🎉</h1>
          <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:8px 0 0;">Thank you for your order</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:30px;">
          <p style="font-size:15px;color:#1a1025;margin:0 0 8px;">Dear <strong>${order.customer_name || 'Customer'}</strong>,</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6;">Your order has been confirmed and payment received. We are preparing your treats with love!</p>

          <!-- Order Info -->
          <div style="background:#F8F4FD;border-radius:12px;padding:20px;margin-bottom:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0;"><span style="font-size:12px;color:#6b7280;">Order Number</span></td>
                <td style="padding:4px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">#${order.orderNumber || order.id?.slice(0, 8) || ''}</span></td>
              </tr>
              <tr>
                <td style="padding:4px 0;"><span style="font-size:12px;color:#6b7280;">Delivery Method</span></td>
                <td style="padding:4px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;text-transform:capitalize;">${order.delivery_method || 'delivery'}</span></td>
              </tr>
              ${order.delivery_address ? `<tr><td style="padding:4px 0;"><span style="font-size:12px;color:#6b7280;">Delivery Address</span></td><td style="padding:4px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${order.delivery_address}${order.delivery_city ? ', ' + order.delivery_city : ''}</span></td></tr>` : ''}
            </table>
          </div>

          <!-- Items -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr><td colspan="2"><p style="font-size:13px;font-weight:600;color:#1a1025;margin:0 0 8px;">Order Items</p></td></tr>
            ${items}
          </table>

          <!-- Total -->
          <div style="border-top:2px solid #F3E8FF;padding-top:16px;margin-top:16px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:4px 0;"><span style="font-size:14px;font-weight:700;color:#1a1025;">Total Paid</span></td>
                <td style="padding:4px 0;text-align:right;"><span style="font-size:18px;font-weight:700;color:#F04B8A;">₦${Number(order.total || 0).toLocaleString()}</span></td>
              </tr>
            </table>
          </div>

          <p style="font-size:13px;color:#6b7280;margin:20px 0 0;line-height:1.6;">We will notify you when your order is on the way. You can track your order in your Bamzy account.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a1025;padding:24px 30px;text-align:center;">
          <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0;">Bamzy Cakes & Confectionery · Ibadan & Southwest Nigeria</p>
          <p style="color:rgba(255,255,255,0.3);font-size:10px;margin:6px 0 0;">This email was sent after your order was confirmed.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

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

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#F8F4FD;font-family:'Segoe UI',Tahoma,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4FD;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(111,74,168,0.12);">
        <tr><td style="background:linear-gradient(135deg,#A97BD6 0%,#F04B8A 100%);padding:30px;text-align:center;">
          <img src="${LOGO_URL}" alt="Bamzy Cakes" width="50" height="50" style="border-radius:50%;border:2px solid rgba(255,255,255,0.3);margin-bottom:10px;" />
          <h1 style="color:#ffffff;font-size:24px;margin:0;font-family:Georgia,serif;">New Contact Message</h1>
          <p style="color:rgba(255,255,255,0.85);font-size:11px;margin:4px 0 0;">From Bamzy Cakes Website</p>
        </td></tr>
        <tr><td style="padding:30px;">
          <div style="background:#F8F4FD;border-radius:12px;padding:20px;margin-bottom:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#6b7280;">From</span></td><td style="padding:4px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${name}</span></td></tr>
              <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#6b7280;">Email</span></td><td style="padding:4px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${email || 'Not provided'}</span></td></tr>
              <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#6b7280;">Phone</span></td><td style="padding:4px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${phone || 'Not provided'}</span></td></tr>
              <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#6b7280;">Subject</span></td><td style="padding:4px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;text-transform:capitalize;">${subject || 'General Enquiry'}</span></td></tr>
            </table>
          </div>
          <p style="font-size:13px;font-weight:600;color:#1a1025;margin:0 0 8px;">Message:</p>
          <div style="background:#fff;border:1px solid #EDE1F8;border-radius:12px;padding:16px;">
            <p style="font-size:14px;color:#4a4458;line-height:1.7;margin:0;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        </td></tr>
        <tr><td style="background:#1a1025;padding:20px 30px;text-align:center;">
          <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0;">Bamzy Cakes & Confectionery — Website Contact Form</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

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

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#F8F4FD;font-family:'Segoe UI',Tahoma,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4FD;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(111,74,168,0.12);">
        <tr><td style="background:linear-gradient(135deg,#A97BD6 0%,#F04B8A 100%);padding:40px 30px;text-align:center;">
          <img src="${LOGO_URL}" alt="Bamzy Cakes" width="50" height="50" style="border-radius:50%;border:2px solid rgba(255,255,255,0.3);margin-bottom:10px;" />
          <h1 style="color:#ffffff;font-size:24px;margin:0;font-family:Georgia,serif;">Login Alert</h1>
          <p style="color:rgba(255,255,255,0.85);font-size:11px;margin:4px 0 0;">Bamzy Cakes & Confectionery</p>
        </td></tr>
        <tr><td style="padding:40px 30px;">
          <h2 style="color:#24172F;font-size:20px;margin:0 0 16px;">New Login Detected</h2>
          <p style="color:#756B7E;font-size:15px;line-height:1.6;margin:0 0 20px;">
            Hi ${userName || 'there'}, we noticed a new login to your Bamzy account. Here are the details:
          </p>
          <div style="background:#F8F4FD;border-radius:12px;padding:20px;margin-bottom:20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#6b7280;">Account</span></td><td style="padding:4px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${toEmail}</span></td></tr>
              <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#6b7280;">Time</span></td><td style="padding:4px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${timeStr}</span></td></tr>
              <tr><td style="padding:4px 0;"><span style="font-size:12px;color:#6b7280;">IP Address</span></td><td style="padding:4px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${ipAddress || 'Unknown'}</span></td></tr>
            </table>
          </div>
          <div style="background:#FFF5F9;border-left:4px solid #F04B8A;border-radius:0 8px 8px 0;padding:16px;margin:24px 0;">
            <p style="color:#756B7E;font-size:13px;margin:0;line-height:1.6;">
              <strong style="color:#F04B8A;">Was this you?</strong> If you did not log in, please change your password immediately or contact our support team.
            </p>
          </div>
        </td></tr>
        <tr><td style="background:#1a1025;padding:20px 30px;text-align:center;">
          <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:0;">Bamzy Cakes & Confectionery &bull; Ibadan, Nigeria</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail }],
      subject: `Login Alert — New sign-in to your Bamzy account`,
      htmlContent,
      textContent: `New login detected on your Bamzy account at ${timeStr}. IP: ${ipAddress || 'Unknown'}. If this was not you, change your password immediately.`,
    })
    console.log(`[EMAIL] Login notification sent to ${toEmail}`)
    return true
  } catch (err) {
    console.error(`[EMAIL] Login notification failed:`, err.message || err)
    return false
  }
}

import { BrevoClient } from '@getbrevo/brevo'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'bamzycakes621@gmail.com'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Bamzy Cakes & Confectionery'
const CLIENT_URL = process.env.CLIENT_URL || 'https://bamzy-cakes.vercel.app'

// Use Cloudinary-hosted logo — works reliably in ALL email clients (Gmail, Apple Mail, Outlook)
const LOGO_URL = 'https://res.cloudinary.com/pqgyfjto/image/upload/v1788861159/bamzy-cakes/bamzy-email-logo-v2.jpg'

let client = null

function getBrevoClient() {
  if (!client) {
    client = new BrevoClient({ auth: { apiKey: BREVO_API_KEY } })
  }
  return client
}

/* ═══════════════════════════════════════════════════════
   SHARED EMAIL HELPERS — consistent header & footer
   ═══════════════════════════════════════════════════════ */

function emailHeader(title, subtitle) {
  return `
  <tr>
    <td style="background:linear-gradient(135deg,#6F4AA8 0%,#A97BD6 50%,#F04B8A 100%);padding:48px 30px 40px;text-align:center;">
      <img src="${LOGO_URL}" alt="Bamzy Cakes & Confectionery" width="120" height="120" style="display:block;margin:0 auto 16px;border-radius:16px;border:4px solid rgba(255,255,255,0.25);" />
      <h1 style="color:#ffffff;font-size:28px;margin:0;font-family:Georgia,serif;font-weight:700;letter-spacing:0.5px;">${title}</h1>
      ${subtitle ? `<p style="color:rgba(255,255,255,0.9);font-size:13px;margin:8px 0 0;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;">${subtitle}</p>` : ''}
    </td>
  </tr>`
}

function emailFooter() {
  return `
  <tr>
    <td style="background:#1a1025;padding:28px 30px;text-align:center;border-radius:0 0 16px 16px;">
      <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0 0 10px;font-weight:500;">
        Bamzy Cakes &amp; Confectionery &bull; Ibadan &amp; Southwest Nigeria
      </p>
      <p style="margin:0 0 12px;">
        <a href="https://instagram.com/bamzycakes" style="color:#D4A5FF;text-decoration:none;font-size:12px;margin:0 8px;">Instagram</a>
        &bull;
        <a href="https://wa.me/2347033374470" style="color:#D4A5FF;text-decoration:none;font-size:12px;margin:0 8px;">WhatsApp</a>
      </p>
      <p style="color:rgba(255,255,255,0.35);font-size:10px;margin:0;line-height:1.5;">
        &copy; ${new Date().getFullYear()} Bamzy Cakes &amp; Confectionery. All rights reserved.
      </p>
    </td>
  </tr>`
}

function emailBody(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
</head>
<body style="margin:0;padding:0;background-color:#F3EEFA;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3EEFA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(111,74,168,0.10);max-width:600px;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Send a professional OTP verification email
 */
export async function sendOtpEmail(toEmail, otpCode, userName) {
  const brevo = getBrevoClient()

  const htmlContent = emailBody(`
    ${emailHeader('Verify Your Email', 'One quick step')}

    <tr>
      <td style="padding:40px 36px;">
        <p style="color:#1a1025;font-size:16px;line-height:1.6;margin:0 0 8px;font-weight:600;">
          Hi ${userName || 'there'} 👋
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
          Thank you for joining Bamzy Cakes &amp; Confectionery! Please use the verification code below to complete your registration:
        </p>

        <!-- OTP Code Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr>
            <td style="background:linear-gradient(135deg,#F3EEFA 0%,#FFF5F9 100%);border:2px dashed #C9B3E8;border-radius:14px;padding:28px 20px;text-align:center;">
              <p style="color:#6b7280;font-size:11px;margin:0 0 10px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your Verification Code</p>
              <p style="color:#6F4AA8;font-size:40px;font-weight:800;letter-spacing:10px;margin:0;font-family:Georgia,serif;">${otpCode}</p>
              <p style="color:#9CA3AF;font-size:12px;margin:14px 0 0;">This code expires in <strong style="color:#6F4AA8;">10 minutes</strong></p>
            </td>
          </tr>
        </table>

        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 20px;">
          If you did not create an account with Bamzy Cakes, please ignore this email. Your account will not be created until you verify.
        </p>

        <hr style="border:none;border-top:1px solid #EDE1F8;margin:28px 0;">
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

  const htmlContent = emailBody(`
    ${emailHeader('Welcome to the Family!', 'Your Bamzy journey begins')}

    <tr>
      <td style="padding:40px 36px;">
        <p style="color:#1a1025;font-size:16px;line-height:1.6;margin:0 0 8px;font-weight:600;">
          Hi ${userName || 'there'} 🎉
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
          Welcome to the Bamzy family! Your account is all set. Here's what you can do from your personal dashboard:
        </p>

        <!-- Feature List -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr>
            <td style="background:linear-gradient(135deg,#F3EEFA 0%,#FFF5F9 100%);border-radius:14px;padding:24px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:36px;">
                    <span style="display:inline-block;width:28px;height:28px;background:#6F4AA8;color:#fff;border-radius:8px;text-align:center;line-height:28px;font-size:14px;font-weight:700;">1</span>
                  </td>
                  <td style="padding:10px 0;vertical-align:top;">
                    <p style="color:#1a1025;font-size:14px;margin:0 0 2px;font-weight:600;">Browse &amp; Order Fresh Treats</p>
                    <p style="color:#6b7280;font-size:13px;margin:0;">Cakes, pastries, small chops, and more — delivered to your door.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:36px;">
                    <span style="display:inline-block;width:28px;height:28px;background:#A97BD6;color:#fff;border-radius:8px;text-align:center;line-height:28px;font-size:14px;font-weight:700;">2</span>
                  </td>
                  <td style="padding:10px 0;vertical-align:top;">
                    <p style="color:#1a1025;font-size:14px;margin:0 0 2px;font-weight:600;">Book Events &amp; Catering</p>
                    <p style="color:#6b7280;font-size:13px;margin:0;">Weddings, birthdays, corporate events — we handle the sweets.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:36px;">
                    <span style="display:inline-block;width:28px;height:28px;background:#F04B8A;color:#fff;border-radius:8px;text-align:center;line-height:28px;font-size:14px;font-weight:700;">3</span>
                  </td>
                  <td style="padding:10px 0;vertical-align:top;">
                    <p style="color:#1a1025;font-size:14px;margin:0 0 2px;font-weight:600;">Join Baking Training</p>
                    <p style="color:#6b7280;font-size:13px;margin:0;">Learn the art of baking from Bamzy's expert chefs.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:36px;">
                    <span style="display:inline-block;width:28px;height:28px;background:#10B981;color:#fff;border-radius:8px;text-align:center;line-height:28px;font-size:14px;font-weight:700;">4</span>
                  </td>
                  <td style="padding:10px 0;vertical-align:top;">
                    <p style="color:#1a1025;font-size:14px;margin:0 0 2px;font-weight:600;">Track Every Order</p>
                    <p style="color:#6b7280;font-size:13px;margin:0;">Real-time updates on preparation, delivery, and status.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr>
            <td align="center">
              <a href="${CLIENT_URL}/shop" style="display:inline-block;background:linear-gradient(135deg,#6F4AA8 0%,#F04B8A 100%);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(240,75,138,0.3);">
                Start Shopping →
              </a>
            </td>
          </tr>
        </table>

        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
          Need help? Just reply to this email or reach us on
          <a href="https://wa.me/2347033374470" style="color:#6F4AA8;font-weight:600;text-decoration:none;">WhatsApp</a>.
          We're always here for you!
        </p>

        <hr style="border:none;border-top:1px solid #EDE1F8;margin:28px 0;">
      </td>
    </tr>

    ${emailFooter()}
  `)

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

  const htmlContent = emailBody(`
    ${emailHeader('Password Reset', 'Secure your account')}

    <tr>
      <td style="padding:40px 36px;">
        <p style="color:#1a1025;font-size:16px;line-height:1.6;margin:0 0 8px;font-weight:600;">
          Hi ${userName || 'there'},
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 28px;">
          We received a request to reset your Bamzy account password. Tap the button below to create a new one:
        </p>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr>
            <td align="center">
              <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#6F4AA8 0%,#F04B8A 100%);color:#ffffff;text-decoration:none;padding:16px 44px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;box-shadow:0 4px 16px rgba(240,75,138,0.3);">
                Reset My Password
              </a>
            </td>
          </tr>
        </table>

        <!-- Expiry Warning -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr>
            <td style="background:#FFF5F9;border-left:4px solid #F04B8A;border-radius:0 10px 10px 0;padding:16px 20px;">
              <p style="color:#374151;font-size:13px;margin:0;line-height:1.6;">
                ⏰ This link expires in <strong style="color:#F04B8A;">5 minutes</strong>. If you didn't request this, please ignore this email — your password will remain unchanged.
              </p>
            </td>
          </tr>
        </table>

        <hr style="border:none;border-top:1px solid #EDE1F8;margin:28px 0;">
      </td>
    </tr>

    ${emailFooter()}
  `)

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
        <td style="padding:40px 36px;">
          <h2 style="color:#1a1025;font-size:22px;margin:0 0 20px;font-family:Georgia,serif;">${subject}</h2>
          <div style="color:#374151;font-size:15px;line-height:1.8;">${message.replace(/\n/g, '<br>')}</div>

          <hr style="border:none;border-top:1px solid #EDE1F8;margin:28px 0;">

          <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">
            You're receiving this because you subscribed to Bamzy's newsletter.<br>
            <a href="${unsubscribeUrl}" style="color:#6F4AA8;text-decoration:none;font-weight:600;">Unsubscribe</a>
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
      <td style="padding:12px 0;border-bottom:1px solid #F3E8FF;">
        <p style="margin:0;font-size:14px;font-weight:600;color:#1a1025;">${item.product_name || item.name || 'Product'}</p>
        <p style="margin:3px 0 0;font-size:12px;color:#6b7280;">Qty: ${item.quantity} × ₦${Number(item.unit_price || item.price || 0).toLocaleString()}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #F3E8FF;text-align:right;">
        <p style="margin:0;font-size:14px;font-weight:700;color:#F04B8A;">₦${Number(item.total_price || item.subtotal || 0).toLocaleString()}</p>
      </td>
    </tr>`).join('')

  const htmlContent = emailBody(`
    ${emailHeader('Order Confirmed!', 'Thank you for your order')}

    <tr>
      <td style="padding:36px;">
        <p style="font-size:15px;color:#1a1025;margin:0 0 8px;font-weight:600;">
          Dear ${order.customer_name || 'Customer'},
        </p>
        <p style="font-size:14px;color:#374151;margin:0 0 24px;line-height:1.7;">
          Your order has been confirmed and payment received. We're preparing your treats with love!
        </p>

        <!-- Order Info -->
        <div style="background:#F3EEFA;border-radius:14px;padding:20px;margin-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:5px 0;"><span style="font-size:12px;color:#6b7280;">Order Number</span></td>
              <td style="padding:5px 0;text-align:right;"><span style="font-size:13px;font-weight:700;color:#1a1025;">#${order.orderNumber || order.id?.slice(0, 8) || ''}</span></td>
            </tr>
            <tr>
              <td style="padding:5px 0;"><span style="font-size:12px;color:#6b7280;">Delivery Method</span></td>
              <td style="padding:5px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;text-transform:capitalize;">${order.delivery_method || 'delivery'}</span></td>
            </tr>
            ${order.delivery_address ? `<tr><td style="padding:5px 0;"><span style="font-size:12px;color:#6b7280;">Delivery Address</span></td><td style="padding:5px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${order.delivery_address}${order.delivery_city ? ', ' + order.delivery_city : ''}</span></td></tr>` : ''}
          </table>
        </div>

        <!-- Items -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr><td colspan="2"><p style="font-size:13px;font-weight:700;color:#1a1025;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;">Order Items</p></td></tr>
          ${items}
        </table>

        <!-- Total -->
        <div style="border-top:2px solid #EDE1F8;padding-top:16px;margin-top:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:5px 0;"><span style="font-size:15px;font-weight:700;color:#1a1025;">Total Paid</span></td>
              <td style="padding:5px 0;text-align:right;"><span style="font-size:20px;font-weight:800;color:#F04B8A;">₦${Number(order.total || 0).toLocaleString()}</span></td>
            </tr>
          </table>
        </div>

        <p style="font-size:13px;color:#6b7280;margin:24px 0 0;line-height:1.7;">
          We'll notify you when your order is on the way. You can track everything from your <a href="${CLIENT_URL}/account" style="color:#6F4AA8;font-weight:600;text-decoration:none;">Bamzy dashboard</a>.
        </p>

        <hr style="border:none;border-top:1px solid #EDE1F8;margin:28px 0;">
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
      <td style="padding:36px;">
        <div style="background:#F3EEFA;border-radius:14px;padding:20px;margin-bottom:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:5px 0;"><span style="font-size:12px;color:#6b7280;">From</span></td><td style="padding:5px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${name}</span></td></tr>
            <tr><td style="padding:5px 0;"><span style="font-size:12px;color:#6b7280;">Email</span></td><td style="padding:5px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${email || 'Not provided'}</span></td></tr>
            <tr><td style="padding:5px 0;"><span style="font-size:12px;color:#6b7280;">Phone</span></td><td style="padding:5px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${phone || 'Not provided'}</span></td></tr>
            <tr><td style="padding:5px 0;"><span style="font-size:12px;color:#6b7280;">Subject</span></td><td style="padding:5px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;text-transform:capitalize;">${subject || 'General Enquiry'}</span></td></tr>
          </table>
        </div>
        <p style="font-size:13px;font-weight:700;color:#1a1025;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px;">Message</p>
        <div style="background:#fff;border:1px solid #EDE1F8;border-radius:14px;padding:20px;">
          <p style="font-size:14px;color:#374151;line-height:1.8;margin:0;">${message.replace(/\n/g, '<br>')}</p>
        </div>

        <hr style="border:none;border-top:1px solid #EDE1F8;margin:28px 0;">
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
      <td style="padding:40px 36px;">
        <h2 style="color:#1a1025;font-size:20px;margin:0 0 16px;">New Login Detected</h2>
        <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Hi ${userName || 'there'}, we noticed a new login to your Bamzy account:
        </p>

        <div style="background:#F3EEFA;border-radius:14px;padding:20px;margin-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:5px 0;"><span style="font-size:12px;color:#6b7280;">Account</span></td><td style="padding:5px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${toEmail}</span></td></tr>
            <tr><td style="padding:5px 0;"><span style="font-size:12px;color:#6b7280;">Time</span></td><td style="padding:5px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${timeStr}</span></td></tr>
            <tr><td style="padding:5px 0;"><span style="font-size:12px;color:#6b7280;">IP Address</span></td><td style="padding:5px 0;text-align:right;"><span style="font-size:13px;font-weight:600;color:#1a1025;">${ipAddress || 'Unknown'}</span></td></tr>
          </table>
        </div>

        <div style="background:#FFF5F9;border-left:4px solid #F04B8A;border-radius:0 10px 10px 0;padding:16px 20px;margin:0 0 24px;">
          <p style="color:#374151;font-size:13px;margin:0;line-height:1.7;">
            <strong style="color:#F04B8A;">Was this you?</strong> If you did not log in, please change your password immediately or contact our support team.
          </p>
        </div>

        <hr style="border:none;border-top:1px solid #EDE1F8;margin:28px 0;">
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

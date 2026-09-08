import { BrevoClient } from '@getbrevo/brevo'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'bamzycakes621@gmail.com'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Bamzy Cakes & Confectionery'
const CLIENT_URL = process.env.CLIENT_URL || 'https://bamzy-cakes.vercel.app'

// Use Cloudinary-hosted logo — works reliably in ALL email clients (Gmail, Apple Mail, Outlook)
const LOGO_URL = 'data:image/jpeg;base64,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PO+dTS5cjaq5Z5mhR521tVR21p5mnjiEQAAAAAAAAAAAAAAAAAAAAArWa3e5ffE3o9HsGtlzPskEldjs1r/OU+L/ADxSkjkuueeuTar2K/nwzbVW1ttpYe5hxDaxbNdijS1dq9CwwmpW8fvbNnK0rqKlbqVVrTzdLLMIgAAAAAAAAAAAAAAAAAAAABWs+GG0It/RUT+Kk8gmia+n5aZ+wzRRGPJH16fQ50JIiavb8xyw7VmfTTrD3MQ8LWmlVekmc1pHKlqeXOMPzZhu8zvRnc4lMcgAAAAAAAAAAAAAAAAAAAAAAGdolfPNjM77IgqTQyzP6D35+zzGSre817StrDlpX4yzts6BevlR6FVmyacGk1daKXOHntDnL3tO4EE/ODk6OToAAAAAAAAAAAAAAAAAAAAAAADz0UqW0a/PN2u2ymhx26S76UWlKnIm2O+Z51yUyq+Tq5VWveqMlg73Q0YucztTzoo9W+eqvNv12Dyx1zlNZd7KIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZ/e6DLVWoy/DVZl/nJBMgAACEmcdgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAENDUztLk9rqqXyP13qrYvEdoxxAAAh894qu+4LHOQ8Su9jdOuO/JOOfefD3yXgnEyAAAAAAABDH2qo5XBF153Vde8ezPbjgmc+HvcXpJLXsc4HOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeRTCGYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACAAMAAAAh88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888E888888888888888888888888888888888888888O88888888888888888888888888888888888888h/888888888888888888888888888888888888881i/8888888888888888888888888888888888888lz98888888888888888888888888888888888877r+Pe88x8888888888888888888888888888888o17095ks7mG9888888888888888888888888888r/AHPODV9nNLGgN/PPPPPPPPPPPPPPPPPPPPPPPO7nNPPNXq8rod/O8dfPPPPPPPPPPPPPPPPPPPPPOHfSWvPPd+mfbuPPGXPPPPPPPPPPPPPPPPPPPPPKPe7XB/PL3X41Wi/PKNvPPPPPPPPPPPPPPPPPPPPHtcDtP8/MNjA+gpPPPP8Azzzzzzzzzzzzzzzzzzzza33nPE/vSHwS6gb/AM88d88888888888888888888291c8138838Ph388888888888888888888888888+m10yWG/X3v0r888888888888888888888888888+We66pd1c3/AHPPPPPPPPPPPPPPPPPPPPPPPPPPPPPKbXPP680lwbfPPPPPPPPPPPPPPPPPPPPPPPPPPPPPDn9rHD7b/PHPPPPPPPPPPPPPPPPPPPPPPPPPPPODmUFW1+vjvbjj0uetfPPPPPPPPPPPPPPPPPPPPPO+JMvFXdcqFfBp3pHlvPPPPPPPPPPPPPPPPPPPPPK/mnb0vFQ6lu/tK2X3vPPPPPPPPPPPPPPPPPPPPPL9NObvPGSOmuvvfmpX/PPPPPPPPPPPPPPPPPPPPPPPfScXvM+PlEdrvO/PPPPPPPPPPPPPPPPPPPPPPPPPPL7zBAN/JoRhMmduivPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPM89+PPPPP9PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPDeXqv/ADzzQPO2scrzzzzzzzzxeOTc/Ktzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz/wD88888888888888888888888888888888888888888888888888888/9oADAMBAAIAAwAAABDzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyrzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzkTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzZ7TzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyWVXzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzw03zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzPDZLlHzznzzzzzzzzzzzzzzzzzzzzzzzzzzzzzygGbPH7ge6nOLLzzzzzzzzzzzzzzzzzzzzzzzzzzyKRzzvaxn7fxk9Dzzzzzzzzzzzzzzzzzzzzzzzz8/wB/88/1vIu628Ja088888888888888888888887zG5b88Uyq/yoK88NW8888888888888888888883+oK9U88ssu+DeC88qd888888888888888888887++5s9qx51xxEVRA88td88888888888888888888Xce8mEc+SjJ+quq8888d888888888888888888882P+c8Xca8386hX888888888888888888888888888q2WxeP88CsWG888888888888888888888888888pZT/wDZ+cXO/wDcbzzzzzzzzzzzzzzzzzzzzzzzzzzzxllfzRqb2JVHvzzzzzzzzzzzzzzzzzzzzzzzzzzzzy2oU59w1/zxzzzzzzzzzzzzzzzzzzzzzzzzzzzzjehTznODy8y37l/hP3zzzzzzzzzzzzzzzzzzzzzyqk3r2lrYHlR5WmmV5XzzzzzzzzzzzzzzzzzzzzzyqrP63elYKpTnpr4x1Tzzzzzzzzzzzzzzzzzzzzzz/wB8r5op0/hU+9/lUsc88888888888888888888888epHA1x/wD/AG4f31jzvvzzzzzzzzzzzzzzzzzzzzzzzzx3awjU3701GKGHg0XzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzTLbjzzzzT/zzzzzzzzzzzzzzzzzzzzzzzzzzzzzycPjz/wA88H7U5+k5888888888ImyP7Bu888888888888888888888888888888888ss88888888888888888888888888888888888888888888888888888/8QAPBEAAQMCAwQHBQgABwEAAAAAAQACAwQREiExBRNBURAiQGFxobEUMlCB8BUgIzORwdHhJDA0QlJwgPH/2gAIAQIBAT8A/wDKXD4Qcsvg4F0R8HDsPBAp2vwZjHnRpKMT25lp/RE3+CQU75jZuiwU9MM8ynbQ/wCLU3aB4tWOmnycLH64qoonRDE3MfAoozI8MHFTSNpowyPX6zRdncrEg4Hop6ox9V2YVVG1j7s0Oiug5XBWEIi3bNmsBc5yqpC6QnpAJNgoqA2vKbIto25E+v7Ix0kgsHW+u9SbOeBeM3Tmlps4WPQD0EW7THG6R2FuqioImDr5lQiFtxHb5KcWkI6dmxA3kPgq6oc95YNAqeAzOwgoZFRTviPVKLY6uPkfRPYWOLXajoBWvaACTYKjg3UeJ2pU9Q6V3cqeYRSXOir2DEJG6Hp2bIMBZxVRQvLy5mhVPCKWMvfqjmb9EEpikutoxiwkHh0tKdr2ampXTHkOaigZELNCnBMbrcijp0Pa5pwu4dLXuYcTTYobRlAsQFNUSTe8VDC6R1mqojZG/C0+KOqnzpLnkP26W6p2vZYYjK8MCa1sTbDIBNcHC7TcKOdsri1vBVNO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'

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

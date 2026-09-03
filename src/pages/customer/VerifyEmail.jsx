import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiVerifyEmail, apiResendVerification } from '../../utils/api.js'
import Button from '../../components/ui/Button.jsx'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [status, setStatus] = useState(token ? 'verifying' : 'pending') // verifying | success | failed | pending
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      apiVerifyEmail(token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('failed'))
    }
  }, [token])

  async function handleResend() {
    if (!email) return
    setResending(true)
    try {
      await apiResendVerification(email)
      setResendSuccess(true)
    } catch {
      // Even if it fails, show success for security
      setResendSuccess(true)
    }
    setResending(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-lilac-soft bg-white p-8 text-center shadow-soft"
      >
        {status === 'verifying' && (
          <>
            <Loader2 size={48} className="mx-auto animate-spin text-pink" />
            <h1 className="mt-6 font-heading text-2xl font-bold text-ink">Verifying your email...</h1>
            <p className="mt-2 text-sm text-ink-muted">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
              <CheckCircle size={56} className="mx-auto text-green-500" />
            </motion.div>
            <h1 className="mt-6 font-heading text-2xl font-bold text-ink">Email Verified!</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Your email has been verified successfully. You now have full access to all Bamzy features.
            </p>
            <div className="mt-6">
              <Button to="/account" size="lg">Go to My Bamzy</Button>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle size={56} className="mx-auto text-red-400" />
            <h1 className="mt-6 font-heading text-2xl font-bold text-ink">Verification Failed</h1>
            <p className="mt-2 text-sm text-ink-muted">
              This verification link is invalid or has expired. You can still use your account, but please verify your email for full access.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {email && (
                <button onClick={handleResend} disabled={resending || resendSuccess}
                  className="flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow disabled:opacity-50">
                  {resending ? 'Sending...' : resendSuccess ? 'Verification email sent!' : 'Resend Verification Email'}
                </button>
              )}
              <Button to="/" variant="outline">Back to Home</Button>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient-soft text-pink">
              <Mail size={28} />
            </span>
            <h1 className="mt-6 font-heading text-2xl font-bold text-ink">Check Your Email</h1>
            <p className="mt-2 text-sm text-ink-muted">
              We&apos;ve sent a verification link to <strong>{email || 'your email address'}</strong>.
              Click the link in the email to verify your account.
            </p>
            <p className="mt-4 text-xs text-ink-muted">
              Didn&apos;t receive the email? Check your spam folder or click below to resend.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {email && (
                <button onClick={handleResend} disabled={resending || resendSuccess}
                  className="flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow disabled:opacity-50">
                  {resending ? 'Sending...' : resendSuccess ? 'Verification email sent!' : 'Resend Verification Email'}
                </button>
              )}
              <Button to="/login" variant="outline">Go to Login</Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

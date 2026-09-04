import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiForgotPassword } from '../../utils/api.js'
import { getImgUrl } from '../../utils/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      await apiForgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-gradient-soft" />
          <img src={getImgUrl('/uploads/brand/ceo.jpg')} alt="Bamzy" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-pink/80 via-lilac/40 to-transparent" />
          <div className="relative z-10 flex flex-col justify-end p-12 text-white">
            <p className="font-heading text-3xl font-bold leading-tight">We&apos;ve got you.</p>
            <p className="mt-3 text-sm text-white/80">Check your email for the reset link.</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-soft">
              <Send size={32} className="text-success" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-ink">Check your email 💗</h1>
            <p className="mt-3 text-ink-muted">
              We sent a password reset link to <strong className="text-ink">{email}</strong>.
              The link expires in 5 minutes.
            </p>
            <p className="mt-6 text-sm text-ink-muted">
              Didn&apos;t receive it? Check your spam folder, or{' '}
              <button onClick={() => { setSent(false); setEmail('') }} className="font-semibold text-pink hover:underline">
                try another email
              </button>.
            </p>
            <Link to="/login" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Brand image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient-soft" />
        <img src={getImgUrl('/uploads/brand/ceo.jpg')} alt="Bamzy" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-pink/80 via-lilac/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <p className="font-heading text-3xl font-bold leading-tight">Don&apos;t worry.</p>
          <p className="mt-3 text-sm text-white/80">We&apos;ll help you get back in.</p>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8 hidden lg:block">
            <img src="/logo.jpg" alt="Bamzy" className="h-10 w-auto" />
          </div>
          <div className="mb-8 text-center lg:hidden">
            <img src="/logo.jpg" alt="Bamzy" className="mx-auto h-12 w-auto" />
          </div>

          <h1 className="font-heading text-3xl font-bold text-ink">Forgot your password?</h1>
          <p className="mt-2 text-ink-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-xl bg-error-soft p-3 text-center text-sm text-error">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="fp-email" className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-lilac-soft bg-white py-3 pl-11 pr-4 text-sm text-ink transition-colors placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={
                'flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-card transition-all duration-200 ' +
                (isSubmitting ? 'cursor-not-allowed bg-ink/30' : 'bg-brand-gradient hover:shadow-glow')
              }
            >
              <Send size={18} />
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <Link to="/login" className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-ink-muted hover:text-ink">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

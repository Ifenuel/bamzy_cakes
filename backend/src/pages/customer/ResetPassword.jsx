import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiResetPassword } from '../../utils/api.js'
import { getImgUrl } from '../../utils/api.js'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const tokenFromUrl = searchParams.get('token') || ''

  const [token, setToken] = useState(tokenFromUrl)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!token) {
      setError('Reset token is required')
      return
    }
    if (!password) {
      setError('Please enter a new password')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      await apiResetPassword(token, password)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Invalid or expired reset link')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-gradient-soft" />
          <img src={getImgUrl('/uploads/brand/ceo.jpg')} alt="Bamzy" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-pink/80 via-lilac/40 to-transparent" />
          <div className="relative z-10 flex flex-col justify-end p-12 text-white">
            <p className="font-heading text-3xl font-bold leading-tight">You&apos;re all set.</p>
            <p className="mt-3 text-sm text-white/80">Your password has been updated.</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-soft">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-ink">Password reset! 💗</h1>
            <p className="mt-3 text-ink-muted">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex items-center rounded-full bg-brand-gradient px-8 py-3.5 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow"
            >
              Login to My Bamzy
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient-soft" />
        <img src={getImgUrl('/uploads/brand/ceo.jpg')} alt="Bamzy" className="absolute inset-0 h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-pink/80 via-lilac/40 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <p className="font-heading text-3xl font-bold leading-tight">Create a new password.</p>
          <p className="mt-3 text-sm text-white/80">Make it strong and memorable.</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8 hidden lg:block">
            <img src="/logo.jpg" alt="Bamzy" className="h-10 w-auto" />
          </div>
          <div className="mb-8 text-center lg:hidden">
            <img src="/logo.jpg" alt="Bamzy" className="mx-auto h-12 w-auto" />
          </div>

          <h1 className="font-heading text-3xl font-bold text-ink">Reset your password</h1>
          <p className="mt-2 text-ink-muted">Enter your new password below.</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-xl bg-error-soft p-3 text-center text-sm text-error">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {!tokenFromUrl && (
              <div>
                <label htmlFor="rp-token" className="mb-1.5 block text-sm font-medium text-ink">Reset Token</label>
                <input
                  id="rp-token"
                  type="text"
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setError('') }}
                  placeholder="Paste the token from your email"
                  className="w-full rounded-xl border border-lilac-soft bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                />
              </div>
            )}

            <div>
              <label htmlFor="rp-password" className="mb-1.5 block text-sm font-medium text-ink">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                <input
                  id="rp-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-lilac-soft bg-white py-3 pl-11 pr-11 text-sm text-ink transition-colors placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-light transition-colors hover:text-ink" tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="rp-confirm" className="mb-1.5 block text-sm font-medium text-ink">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                <input
                  id="rp-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-lilac-soft bg-white py-3 pl-11 pr-4 text-sm text-ink transition-colors placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                  autoComplete="new-password"
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
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

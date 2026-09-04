import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Send, KeyRound, ShieldCheck, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiForgotPassword, apiResetPassword } from '../../utils/api.js'

const STEPS = [
  { icon: Mail, label: 'Enter Email', desc: 'We\'ll send you a secure reset link' },
  { icon: KeyRound, label: 'Check Inbox', desc: 'Click the link in your email (expires in 5 min)' },
  { icon: ShieldCheck, label: 'New Password', desc: 'Create a fresh password and you\'re back in' },
]

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Reset password form state
  const [showReset, setShowReset] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

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
      setCurrentStep(1)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault()
    if (!resetToken) { setResetError('Please paste the token from your email'); return }
    if (!newPassword) { setResetError('Please enter a new password'); return }
    if (newPassword.length < 6) { setResetError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setResetError('Passwords do not match'); return }
    setResetLoading(true)
    setResetError('')
    try {
      await apiResetPassword(resetToken, newPassword)
      setResetSuccess(true)
      setCurrentStep(2)
    } catch (err) {
      setResetError(err.message || 'Invalid or expired reset link')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lilac-soft/20 via-white to-pink-soft/20">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/logo.jpg" alt="Bamzy" className="h-12 w-12 rounded-full object-cover ring-2 ring-lilac-soft/50" />
            <div>
              <p className="font-heading text-lg font-bold text-ink">Bamzy Cakes</p>
              <p className="text-[10px] text-ink-muted">& Confectionery</p>
            </div>
          </Link>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              const isActive = i === currentStep
              const isDone = i < currentStep
              return (
                <div key={i} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-500 ${
                      isDone ? 'bg-green-500 text-white' : isActive ? 'bg-brand-gradient text-white shadow-glow' : 'bg-lilac-soft/50 text-ink-muted'
                    }`}>
                      {isDone ? <CheckCircle size={20} /> : <Icon size={18} />}
                    </div>
                    <p className={`text-[10px] sm:text-xs font-medium transition-colors ${isActive ? 'text-ink' : 'text-ink-muted'}`}>
                      {step.label}
                    </p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mb-5 h-0.5 w-8 sm:w-16 transition-colors duration-500 ${
                      i < currentStep ? 'bg-green-400' : 'bg-lilac-soft/50'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          {/* STEP 0: Enter email form */}
          {!sent && !showReset && !resetSuccess && (
            <motion.div
              key="email-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-md"
            >
              <div className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-soft sm:p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-soft/60">
                    <Lock size={28} className="text-pink" />
                  </div>
                  <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Forgot your password?</h1>
                  <p className="mt-2 text-sm text-ink-muted">
                    No worries — it happens to the best of us. Enter your registered email and we&apos;ll help you get back into your Bamzy account.
                  </p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-xl bg-error-soft p-3 text-center text-sm text-error">
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fp-email" className="mb-1.5 block text-sm font-medium text-ink">Email address</label>
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
                    className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-card transition-all duration-200 bg-brand-gradient hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={18} />
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                  <Link to="/login" className="flex items-center gap-1.5 text-ink-muted hover:text-ink transition-colors">
                    <ArrowLeft size={14} /> Back to Login
                  </Link>
                  <span className="text-ink-light">|</span>
                  <Link to="/register" className="text-pink font-medium hover:underline">Create Account</Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Check your email */}
          {sent && !showReset && !resetSuccess && (
            <motion.div
              key="check-email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-md"
            >
              <div className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-soft sm:p-8">
                <div className="mb-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50"
                  >
                    <Send size={28} className="text-green-500" />
                  </motion.div>
                  <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Check your email 💗</h1>
                  <p className="mt-2 text-sm text-ink-muted">
                    We sent a password reset link to{' '}
                    <strong className="text-ink">{email}</strong>.
                    The link expires in 5 minutes.
                  </p>
                </div>

                {/* What to do next */}
                <div className="rounded-xl bg-brand-gradient-subtle p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-lilac-deep">What to do next:</p>
                  <ol className="space-y-2 text-sm text-ink-muted">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink text-[10px] font-bold text-white">1</span>
                      Open your email inbox (check spam/junk too)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink text-[10px] font-bold text-white">2</span>
                      Click the &ldquo;Reset Password&rdquo; link in the email
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink text-[10px] font-bold text-white">3</span>
                      You&apos;ll be taken to a page where you can create a new password
                    </li>
                  </ol>
                </div>

                <div className="mt-6 space-y-3 text-center">
                  <p className="text-sm text-ink-muted">
                    Didn&apos;t receive the email?{' '}
                    <button onClick={() => { setSent(false); setEmail(''); setCurrentStep(0) }} className="font-semibold text-pink hover:underline">
                      Try another email
                    </button>
                  </p>
                  <p className="text-sm text-ink-muted">
                    Already have the reset link?{' '}
                    <button onClick={() => setShowReset(true)} className="font-semibold text-pink hover:underline">
                      Enter reset token
                    </button>
                  </p>
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink">
                    <ArrowLeft size={14} /> Back to Login
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1b: Enter reset token + new password */}
          {showReset && !resetSuccess && (
            <motion.div
              key="reset-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-md"
            >
              <div className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-soft sm:p-8">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-soft/60">
                    <ShieldCheck size={28} className="text-pink" />
                  </div>
                  <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Reset your password</h1>
                  <p className="mt-2 text-sm text-ink-muted">
                    Paste the reset token from your email and create a new password.
                  </p>
                </div>

                {resetError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-xl bg-error-soft p-3 text-center text-sm text-error">
                    {resetError}
                  </motion.div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="rp-token" className="mb-1.5 block text-sm font-medium text-ink">Reset Token</label>
                    <div className="relative">
                      <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                      <input
                        id="rp-token"
                        type="text"
                        value={resetToken}
                        onChange={(e) => { setResetToken(e.target.value); setResetError('') }}
                        placeholder="Paste the token from your email"
                        className="w-full rounded-xl border border-lilac-soft bg-white py-3 pl-11 pr-4 text-sm text-ink transition-colors placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="rp-password" className="mb-1.5 block text-sm font-medium text-ink">New Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                      <input
                        id="rp-password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setResetError('') }}
                        placeholder="Min 6 characters"
                        className="w-full rounded-xl border border-lilac-soft bg-white py-3 pl-11 pr-11 text-sm text-ink transition-colors placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink" tabIndex={-1}>
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
                        onChange={(e) => { setConfirmPassword(e.target.value); setResetError('') }}
                        placeholder="Re-enter your password"
                        className="w-full rounded-xl border border-lilac-soft bg-white py-3 pl-11 pr-4 text-sm text-ink transition-colors placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-card transition-all duration-200 bg-brand-gradient hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShieldCheck size={18} />
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button onClick={() => { setShowReset(false) }} className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink mx-auto">
                    <ArrowLeft size={14} /> Back to email entry
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Success */}
          {resetSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-md"
            >
              <div className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-soft sm:p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50"
                >
                  <CheckCircle size={32} className="text-green-500" />
                </motion.div>
                <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Password reset! 🎉</h1>
                <p className="mt-2 text-sm text-ink-muted">
                  Your password has been updated successfully. You can now log in with your new password.
                </p>
                <Link
                  to="/login"
                  className="mt-6 inline-flex items-center rounded-full bg-brand-gradient px-8 py-3.5 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow"
                >
                  Login to My Bamzy
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center text-xs text-ink-muted"
        >
          🔒 Your account is protected with encrypted passwords and secure verification.
        </motion.p>
      </div>
    </div>
  )
}

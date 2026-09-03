import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, ShieldCheck, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import { apiSendOtp, apiVerifyOtp, apiResendOtp, getImgUrl } from '../../utils/api.js'

/* ─── Feature highlights for left panel ─── */
const FEATURES = [
  { icon: '🎂', title: 'Fresh Cakes & Pastries', desc: 'Baked daily with premium ingredients' },
  { icon: '📦', title: 'Easy Order Tracking', desc: 'Know exactly where your order is' },
  { icon: '🎉', title: 'Event Catering', desc: 'Weddings, birthdays & celebrations' },
  { icon: '🎓', title: 'Baking Trainings', desc: 'Learn professional baking skills' },
]

function FeatureCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.12, duration: 0.5 }}
      className="flex items-center gap-4 rounded-2xl bg-white/10 backdrop-blur-sm p-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
        {item.icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{item.title}</p>
        <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
      </div>
    </motion.div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  // Step tracking: 'form' → 'otp' → 'done'
  const [step, setStep] = useState('form')

  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpTimer, setOtpTimer] = useState(60)
  const [otpError, setOtpError] = useState('')
  const [otpSuccess, setOtpSuccess] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const otpRefs = useRef([])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/account', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // OTP countdown timer
  useEffect(() => {
    if (step !== 'otp' || otpTimer <= 0) return
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000)
    return () => clearInterval(interval)
  }, [step, otpTimer])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  // Step 1: Submit form → Send OTP
  async function handleSubmitForm(e) {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password) {
      setError('Please fill in all required fields')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      await apiSendOtp(form.email, form.full_name)
      setStep('otp')
      setOtpTimer(60)
      otpRefs.current[0]?.focus()
    } catch (err) {
      setError(err.message || 'Failed to send verification code')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 2: Handle OTP input
  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)
    setOtpError('')

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all 6 digits entered
    if (newDigits.every((d) => d !== '') && newDigits.join('').length === 6) {
      handleVerifyOtp(newDigits.join(''))
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newDigits = pasted.split('')
      setOtpDigits(newDigits)
      otpRefs.current[5]?.focus()
      handleVerifyOtp(pasted)
    }
  }

  // Step 2: Verify OTP → Create account
  async function handleVerifyOtp(code) {
    setIsVerifying(true)
    setOtpError('')
    try {
      await apiVerifyOtp(form.email, code)
      setOtpSuccess('Email verified! Creating your account...')
      await register(form.full_name, form.email, form.password, form.phone)
      setStep('done')
      setTimeout(() => navigate('/account'), 1500)
    } catch (err) {
      setOtpError(err.message || 'Verification failed')
      setOtpDigits(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    setOtpError('')
    setOtpSuccess('')
    try {
      await apiResendOtp(form.email, form.full_name)
      setOtpTimer(60)
      setOtpDigits(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
      setOtpSuccess('New code sent!')
    } catch (err) {
      setOtpError(err.message || 'Failed to resend code')
    }
  }

  const ic = 'w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 pl-11 pr-4 text-sm text-ink transition-all placeholder:text-ink-light/50 focus:border-lilac focus:bg-white focus:outline-none focus:ring-2 focus:ring-lilac/20'

  return (
    <div className="min-h-screen flex">
      {/* ═══ LEFT — Elegant Brand Panel ═══ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-[#2a1440] via-[#3d1a5e] to-[#6F4AA8]">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-pink/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-lilac/15 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-10 xl:p-14">
          {/* Top — Brand */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <img src="/logo.jpg" alt="Bamzy Cakes & Confectionery" className="h-16 sm:h-20 w-auto" />
          </motion.div>

          {/* Center — Brand message + product showcase */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-sm font-medium text-white/50 uppercase tracking-widest mb-4">
                Bamzy Cakes & Confectionery
              </p>
              <h2 className="font-heading text-4xl xl:text-5xl font-bold text-white leading-[1.15]">
                Every treat has<br />
                <span className="text-pink-soft">a story.</span>
              </h2>
              <p className="mt-5 text-base text-white/60 leading-relaxed max-w-md">
                Join thousands of happy customers who trust Bamzy for their cakes, pastries, events and special celebrations.
              </p>
            </motion.div>

            {/* Feature highlights */}
            <div className="mt-8 space-y-3">
              {FEATURES.map((item, i) => (
                <FeatureCard key={item.title} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* Bottom — trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex items-center gap-6 text-white/40 text-xs"
          >
            <span>Ibadan & Southwest Nigeria</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>Delivery & Pickup</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>Made Fresh Daily</span>
          </motion.div>
        </div>
      </div>

      {/* ═══ RIGHT — Form / OTP / Done ═══ */}
      <div className="flex w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-[45%] bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-10 text-center lg:hidden">
            <img src="/logo.jpg" alt="Bamzy Cakes & Confectionery" className="mx-auto h-20 sm:h-24 w-auto" />
          </div>

          {/* Desktop logo */}
          <div className="mb-10 hidden lg:block">
            <img src="/logo.jpg" alt="Bamzy Cakes & Confectionery" className="h-16 sm:h-20 w-auto" />
          </div>

          <AnimatePresence mode="wait">
            {/* ═══════ STEP 1: Registration Form ═══════ */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-heading text-3xl sm:text-[2rem] font-bold text-ink leading-tight">
                  Create your <span className="text-gradient">Bamzy</span> account
                </h1>
                <p className="mt-2 text-ink-muted text-[15px]">
                  Save your orders, bookings and favourite treats in one place.
                </p>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-5 rounded-xl bg-error-soft px-4 py-3 text-center text-sm text-error">
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmitForm} className="mt-8 space-y-4">
                  <div>
                    <label htmlFor="reg-name" className="mb-2 block text-sm font-medium text-ink">Full Name *</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                      <input id="reg-name" name="full_name" value={form.full_name} onChange={handleChange}
                        placeholder="Dami Awoyo" className={ic} autoComplete="name" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-email" className="mb-2 block text-sm font-medium text-ink">Email *</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                      <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange}
                        placeholder="dami@example.com" className={ic} autoComplete="email" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className="mb-2 block text-sm font-medium text-ink">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                      <input id="reg-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                        placeholder="0801 234 5678" className={ic} autoComplete="tel" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="mb-2 block text-sm font-medium text-ink">Password *</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                      <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'}
                        value={form.password} onChange={handleChange} placeholder="Min 6 characters"
                        className={ic} style={{ paddingRight: '2.75rem' }} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-light transition-colors hover:text-ink" tabIndex={-1}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-confirm" className="mb-2 block text-sm font-medium text-ink">Confirm Password *</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                      <input id="reg-confirm" name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword} onChange={handleChange} placeholder="••••••••"
                        className={ic} style={{ paddingRight: '2.75rem' }} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-light transition-colors hover:text-ink" tabIndex={-1}>
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-3.5 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending code...
                      </span>
                    ) : (
                      <>
                        <Mail size={18} /> Verify Email
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-xs text-ink-light">or</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                <p className="mt-6 text-center text-sm text-ink-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-pink hover:text-lilac-deep transition-colors">
                    Sign In
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ═══════ STEP 2: OTP Verification ═══════ */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <button onClick={() => setStep('form')}
                  className="mb-6 flex items-center gap-2 text-sm font-medium text-lilac-deep hover:text-pink">
                  <ArrowLeft size={16} /> Back to form
                </button>

                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient-soft">
                  <ShieldCheck size={28} className="text-pink" />
                </div>

                <h1 className="font-heading text-2xl font-bold text-ink text-center">Verify your email</h1>
                <p className="mt-2 text-center text-ink-muted">
                  We sent a 6-digit code to<br />
                  <span className="font-semibold text-ink">{form.email}</span>
                </p>

                {otpError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 rounded-xl bg-error-soft p-3 text-center text-sm text-error">
                    {otpError}
                  </motion.div>
                )}

                {otpSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 rounded-xl bg-success-soft p-3 text-center text-sm text-success">
                    {otpSuccess}
                  </motion.div>
                )}

                {/* OTP Input */}
                <div className="mt-8 flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      disabled={isVerifying}
                      className="h-14 w-12 rounded-xl border-2 border-lilac-soft bg-white text-center text-xl font-bold text-ink transition-all focus:border-pink focus:outline-none focus:ring-2 focus:ring-pink/20 disabled:opacity-50 sm:h-16 sm:w-14"
                    />
                  ))}
                </div>

                {isVerifying && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-muted">
                    <Loader2 size={16} className="animate-spin" /> Verifying...
                  </div>
                )}

                {/* Resend */}
                <div className="mt-6 text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-ink-muted">
                      Resend code in <span className="font-semibold text-pink">{otpTimer}s</span>
                    </p>
                  ) : (
                    <button onClick={handleResendOtp}
                      className="text-sm font-semibold text-pink hover:underline">
                      Resend Code
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══════ STEP 3: Success ═══════ */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-soft"
                >
                  <CheckCircle size={40} className="text-green-500" />
                </motion.div>
                <h1 className="font-heading text-3xl font-bold text-ink">Welcome to Bamzy! 🎉</h1>
                <p className="mt-3 text-ink-muted">
                  Your account has been created. Redirecting you to your dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

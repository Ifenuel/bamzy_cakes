import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()

  const savedEmail = localStorage.getItem('bamzy_remembered_email') || ''

  const [form, setForm] = useState({ email: savedEmail, password: '' })
  const [rememberMe, setRememberMe] = useState(!!savedEmail)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/account', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address')
      return
    }
    setIsSubmitting(true)
    try {
      await login(form.email, form.password)
      if (rememberMe) {
        localStorage.setItem('bamzy_remembered_email', form.email)
      } else {
        localStorage.removeItem('bamzy_remembered_email')
      }
      navigate('/account')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-white to-pink-soft/30 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <img src="/logo.jpg" alt="Bamzy Cakes & Confectionery" className="mx-auto h-20 sm:h-24 w-auto mb-3" />
          <p className="text-sm font-medium text-ink-muted">Cakes & Confectionery</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-lilac-soft/60 bg-white p-8 shadow-soft">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-ink">
              Welcome back 👋
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Ready for something delicious?
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl bg-error-soft px-4 py-3 text-sm text-error"
            >
              <p className="text-center">{error}</p>
              {error.toLowerCase().includes('no account found') && (
                <p className="mt-2 text-center">
                  <Link to="/register" className="font-semibold underline hover:text-lilac-deep">
                    Create an account →
                  </Link>
                </p>
              )}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-ink">
                Email address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm text-ink transition-all placeholder:text-ink-light/50 focus:border-lilac focus:bg-white focus:outline-none focus:ring-2 focus:ring-lilac/20"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-ink">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-11 text-sm text-ink transition-all placeholder:text-ink-light/50 focus:border-lilac focus:bg-white focus:outline-none focus:ring-2 focus:ring-lilac/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light transition-colors hover:text-ink"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-pink focus:ring-lilac/20 accent-pink"
                />
                <span className="text-sm text-ink-muted">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-pink hover:text-lilac-deep transition-colors">
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-ink-light">or</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Create account */}
          <p className="text-center text-sm text-ink-muted">
            New to Bamzy?{' '}
            <Link to="/register" className="font-semibold text-pink hover:text-lilac-deep transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        {/* Trust strip */}
        <p className="mt-6 text-center text-xs text-ink-muted">
          Ibadan & Southwest Nigeria · Delivery & Pickup · Made Fresh Daily
        </p>
      </motion.div>
    </div>
  )
}

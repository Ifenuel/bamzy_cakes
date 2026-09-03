import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import PageContainer from '../../components/layout/PageContainer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address')
      return
    }
    setIsSubmitting(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role !== 'admin') {
        setError('This account is not an admin account.')
        return
      }
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center">
          <img src="/logo.jpg" alt="Bamzy" className="mx-auto mb-6 h-16 w-auto" />
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-soft">
            <Shield size={28} />
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold text-ink">Admin Panel</h1>
          <p className="mt-2 text-ink-muted">Sign in with your admin credentials</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl bg-error-soft p-3 text-center text-sm text-error">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-ink">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
              <input
                id="admin-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@bamzycakes.com"
                autoComplete="email"
                className="w-full rounded-xl border border-lilac-soft bg-white py-3 pl-11 pr-4 text-sm text-ink transition-colors placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-ink">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-lilac-soft bg-white py-3 pl-11 pr-11 text-sm text-ink transition-colors placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-light transition-colors hover:text-ink"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white shadow-card transition-all duration-200 bg-brand-gradient hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : <><Shield size={18} /> Admin Sign In</>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          <Link to="/admin/register" className="font-medium text-pink hover:underline">Create admin account</Link>
        </p>
        <p className="mt-2 text-center text-sm text-ink-muted">
          <Link to="/login" className="font-medium text-pink hover:underline">← Back to customer login</Link>
        </p>
      </motion.div>
    </div>
  )
}

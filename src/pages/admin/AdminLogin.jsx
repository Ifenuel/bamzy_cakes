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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2a1440] via-[#3d1a5e] to-[#1a1025] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center">
          <img src="/logo.jpg" alt="Bamzy" className="mx-auto mb-6 h-20 sm:h-24 w-auto brightness-110" />
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white/80">
            <Shield size={24} />
          </span>
          <h1 className="mt-4 font-heading text-3xl font-bold text-white">Admin Panel</h1>
          <p className="mt-2 text-white/60">Sign in with your admin credentials</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl bg-error-soft p-3 text-center text-sm text-error">
            {error}
          </motion.div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-8 shadow-elevated">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-white/80">Email</label>
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
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white transition-colors placeholder:text-white/40 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/30"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-white/80">Password</label>
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
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-11 text-sm text-white transition-colors placeholder:text-white/40 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
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

        </div>

        <p className="mt-6 text-center text-sm text-white/50">
          <Link to="/login" className="font-medium text-pink-soft hover:text-white transition-colors">← Back to customer login</Link>
        </p>
      </motion.div>
    </div>
  )
}

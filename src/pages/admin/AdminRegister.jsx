import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, X, User } from 'lucide-react'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { apiUploadImage } from '../../utils/api.js'
import { getImgUrl } from '../../utils/api.js'

export default function AdminRegister() {
  const navigate = useNavigate()
  const { registerAdmin } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [avatar, setAvatar] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  async function handleImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    setUploading(true)
    try {
      const data = await apiUploadImage('brand', file)
      setAvatar(data.imageUrl)
    } catch {
      setError('Image upload failed. Is the backend running?')
    }
    setUploading(false)
  }

  function handleFileChange(e) {
    handleImageUpload(e.target.files[0])
  }

  function handleDrop(e) {
    e.preventDefault()
    handleImageUpload(e.dataTransfer.files[0])
  }

  async function handleSubmit(e) {
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
    try {
      const user = await registerAdmin(
        form.full_name,
        form.email,
        form.password,
        form.phone,
        avatar || null
      )
      if (user.role !== 'admin') {
        setError('Registration succeeded but this account is not admin. Contact support.')
        return
      }
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const ic =
    'w-full rounded-xl border border-lilac-soft bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-muted/50 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20'

  return (
    <Section>
      <PageContainer>
        <div className="mx-auto max-w-md py-12">
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-soft">
              <Shield size={28} />
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold">Create Admin Account</h1>
            <p className="mt-2 text-ink-muted">Set up your admin profile</p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-pink-soft p-3 text-center text-sm text-pink">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <label className="mb-2 block text-sm font-medium text-ink">
                Profile Photo
              </label>
              {avatar ? (
                <div className="relative">
                  <img
                    src={getImgUrl(avatar)}
                    alt="Admin avatar"
                    className="h-24 w-24 rounded-full object-cover shadow-soft"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatar('')}
                    className="absolute -right-1 -top-1 rounded-full bg-ink/60 p-1 text-white hover:bg-ink/80"
                  >
                    <X size={12} />
                  </button>
                  <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-white px-2 py-1 text-[10px] font-medium text-ink shadow-sm hover:bg-lilac-soft">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed border-lilac-soft bg-lilac-50 transition-colors hover:border-lilac"
                >
                  {uploading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink border-t-transparent" />
                  ) : (
                    <>
                      <User size={24} className="text-lilac/40" />
                      <label className="mt-1 cursor-pointer text-[9px] font-medium text-lilac/60 hover:text-lilac">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>
              )}
              <p className="mt-2 text-[11px] text-ink-muted">
                Optional — your photo will show in the admin sidebar
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Full Name *
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                className={ic}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@bamzycakes.com"
                className={ic}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="08012345678"
                className={ic}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Password *
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className={ic}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">
                Confirm Password *
              </label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={ic}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-card transition-all ${
                isSubmitting
                  ? 'cursor-not-allowed bg-ink/30'
                  : 'bg-brand-gradient hover:shadow-glow'
              }`}
            >
              <Shield size={20} />
              {isSubmitting ? 'Creating Account...' : 'Create Admin Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an admin account?{' '}
            <Link
              to="/admin/login"
              className="font-medium text-pink hover:underline"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-ink-muted">
            <Link to="/login" className="font-medium text-pink hover:underline">
              ← Back to customer login
            </Link>
          </p>
        </div>
      </PageContainer>
    </Section>
  )
}

import { useState, useEffect } from 'react'
import { Star, Trash2, Eye, EyeOff, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '../../components/ui/Toast.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function adminRequest(path, options = {}) {
  const token = localStorage.getItem('bamzy_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed')
  return data.data
}

export default function AdminReviews() {
  const { showToast } = useToast()
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadReviews()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadReviews() {
    try {
      const data = await adminRequest('/reviews/admin/all')
      setReviews(data || [])
    } catch {
      showToast('Failed to load reviews', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleApproval(id, current) {
    try {
      await adminRequest(`/reviews/admin/${id}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ is_approved: !current }),
      })
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, isApproved: !current } : r))
      showToast(current ? 'Review hidden' : 'Review approved', 'success')
    } catch (err) {
      showToast(err.message || 'Failed', 'error')
    }
  }

  async function deleteReview(id) {
    try {
      await adminRequest(`/reviews/admin/${id}`, { method: 'DELETE' })
      setReviews((prev) => prev.filter((r) => r.id !== id))
      showToast('Review deleted', 'info')
    } catch (err) {
      showToast(err.message || 'Failed', 'error')
    }
  }

  const filtered = filter === 'all' ? reviews : filter === 'approved' ? reviews.filter((r) => r.isApproved) : reviews.filter((r) => !r.isApproved)
  const stats = {
    total: reviews.length,
    approved: reviews.filter((r) => r.isApproved).length,
    pending: reviews.filter((r) => !r.isApproved).length,
    avgRating: reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '0',
  }

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })

  if (isLoading) return <div className="py-20 text-center text-ink-muted">Loading reviews...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Reviews</h1>
        <p className="mt-1 text-sm text-ink-muted">Manage customer reviews and feedback.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-lilac-soft text-lilac-deep' },
          { label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-700' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Avg Rating', value: stats.avgRating + '/5', color: 'bg-pink-soft text-pink' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-3 text-center ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'approved', 'pending'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-brand-gradient text-white' : 'border border-lilac-soft text-ink-muted hover:border-lilac'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.map((review) => (
          <motion.div key={review.id} layout className="rounded-xl border border-lilac-soft bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5 text-pink">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <span className="text-xs text-ink-muted">{fd(review.createdAt)}</span>
                  {!review.isApproved && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-700">Pending</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-ink">&ldquo;{review.text}&rdquo;</p>
                <p className="mt-2 text-xs font-medium text-ink-muted">&mdash; {review.customerName}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleApproval(review.id, review.isApproved)} title={review.isApproved ? 'Hide' : 'Approve'}
                  className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-lilac-soft hover:text-pink">
                  {review.isApproved ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => deleteReview(review.id)} title="Delete"
                  className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-red-50 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <MessageCircle size={40} className="mx-auto text-ink-muted/30" />
            <p className="mt-3 text-sm text-ink-muted">{filter === 'all' ? 'No reviews yet.' : `No ${filter} reviews.`}</p>
          </div>
        )}
      </div>
    </div>
  )
}

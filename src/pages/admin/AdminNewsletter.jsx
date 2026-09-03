import { useState, useEffect } from 'react'
import { Mail, Users, UserCheck, UserX, Send, Loader2, CheckCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { apiGetNewsletterStats } from '../../utils/api.js'
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

export default function AdminNewsletter() {
  const { showToast } = useToast()
  const [stats, setStats] = useState({ total: 0, active: 0, brevo: { configured: false } })
  const [subscribers, setSubscribers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [statsData, listData] = await Promise.all([
        apiGetNewsletterStats(),
        adminRequest('/newsletter/admin/list'),
      ])
      setStats(statsData || { total: 0, active: 0, brevo: { configured: false } })
      setSubscribers(listData || [])
    } catch {
      // Stats endpoint might not exist yet
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      showToast('Subject and message are required', 'error')
      return
    }
    setSending(true)
    setSendResult(null)
    try {
      const result = await adminRequest('/newsletter/admin/send', {
        method: 'POST',
        body: JSON.stringify({ subject: emailForm.subject, message: emailForm.message }),
      })
      setSendResult(result)
      showToast(`Newsletter sent to ${result.sent} subscribers!`, 'success')
      setShowCompose(false)
      setEmailForm({ subject: '', message: '' })
    } catch (err) {
      showToast(err.message || 'Failed to send newsletter', 'error')
    } finally {
      setSending(false)
    }
  }

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
  const brevoConnected = stats.brevo?.configured

  if (isLoading) return <div className="py-20 text-center text-ink-muted">Loading newsletter...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Newsletter</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage subscribers and send email updates via Brevo.</p>
        </div>
        <button onClick={() => setShowCompose(true)}
          className="flex shrink-0 items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:shadow-glow transition-all">
          <Send size={16} /> Compose Newsletter
        </button>
      </div>

      {/* Brevo Status */}
      <div className={`flex items-center gap-3 rounded-xl border p-4 ${brevoConnected ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        {brevoConnected ? (
          <>
            <Wifi size={18} className="shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">Brevo Connected</p>
              <p className="text-xs text-green-600">
                Emails will be sent to {stats.active} subscribers via Brevo.
                {stats.brevo.email && ` Sending from: ${stats.brevo.email}`}
              </p>
            </div>
          </>
        ) : (
          <>
            <WifiOff size={18} className="shrink-0 text-yellow-600" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Brevo Not Connected</p>
              <p className="text-xs text-yellow-600">
                Set BREVO_API_KEY in your backend .env to enable email sending.
                Subscribers are still being collected.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total Subscribers', value: stats.total, icon: Users, color: 'bg-lilac-soft text-lilac-deep' },
          { label: 'Active Subscribers', value: stats.active, icon: UserCheck, color: 'bg-green-50 text-green-700' },
          { label: 'Unsubscribed', value: stats.total - stats.active, icon: UserX, color: 'bg-ink/5 text-ink-muted' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <div className="flex items-center gap-3">
              <Icon size={20} />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Last Send Result */}
      {sendResult && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle size={18} className="shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-800">Last Newsletter Sent</p>
            <p className="text-xs text-green-600">
              Sent to {sendResult.sent} subscribers
              {sendResult.failed > 0 && ` (${sendResult.failed} failed)`}
            </p>
          </div>
        </motion.div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={() => setShowCompose(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6">
            <h2 className="font-heading text-lg font-semibold">Compose Newsletter</h2>
            <p className="mt-1 text-sm text-ink-muted">
              {brevoConnected
                ? `This will be emailed to ${stats.active} active subscribers via Brevo.`
                : `Will be queued — connect Brevo to enable email delivery.`}
            </p>
            <form onSubmit={handleSend} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Subject *</label>
                <input value={emailForm.subject} onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. New treats this week at Bamzy!"
                  className="w-full rounded-xl border border-lilac-soft px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Message *</label>
                <textarea value={emailForm.message} onChange={(e) => setEmailForm((p) => ({ ...p, message: e.target.value }))} rows={6}
                  placeholder="Write your newsletter content here..."
                  className="w-full resize-none rounded-xl border border-lilac-soft px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20" />
              </div>
              {!brevoConnected && (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3">
                  <AlertTriangle size={14} className="shrink-0 text-yellow-600" />
                  <p className="text-xs text-yellow-700">Brevo is not connected. Configure BREVO_API_KEY to enable delivery.</p>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCompose(false)}
                  className="flex-1 rounded-full border border-lilac-soft px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-lilac-soft">Cancel</button>
                <button type="submit" disabled={sending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow disabled:opacity-50">
                  {sending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Newsletter'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Subscribers List */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-ink">Subscribers ({subscribers.length})</h2>
        <div className="mt-3 space-y-2">
          {subscribers.map((sub) => (
            <div key={sub.id} className="flex items-center gap-4 rounded-xl border border-lilac-soft bg-white p-3 shadow-sm">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink-muted'}`}>
                <Mail size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{sub.email}</p>
                {sub.fullName && <p className="text-xs text-ink-muted">{sub.fullName}</p>}
              </div>
              <div className="text-right">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink-muted'}`}>
                  {sub.isActive ? 'Active' : 'Unsubscribed'}
                </span>
                <p className="mt-0.5 text-[10px] text-ink-muted">{fd(sub.subscribedAt)}</p>
              </div>
            </div>
          ))}
          {subscribers.length === 0 && (
            <div className="py-12 text-center">
              <Mail size={40} className="mx-auto text-ink-muted/30" />
              <p className="mt-3 text-sm text-ink-muted">No subscribers yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

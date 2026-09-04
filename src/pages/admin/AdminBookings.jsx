import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck, Search, MapPin, Users as UsersIcon, Clock, CheckCircle, XCircle, RefreshCw, ChevronDown, Phone, Mail } from 'lucide-react'
import { apiGetAllBookings, apiUpdateBookingStatus } from '../../utils/api.js'
import { useToast } from '../../components/ui/Toast.jsx'

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
const STATUS_CONFIG = {
  pending:    { label: 'Pending',     color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  confirmed:  { label: 'Confirmed',   color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-400' },
  in_progress:{ label: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200',   dot: 'bg-blue-400' },
  completed:  { label: 'Completed',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  cancelled:  { label: 'Cancelled',   color: 'bg-red-50 text-red-700 border-red-200',       dot: 'bg-red-400' },
}

const EVENT_ICONS = {
  wedding: '💒', birthday: '🎂', corporate: '🏢', baby_shower: '👶', anniversary: '💕', other: '🎉',
}

export default function AdminBookings() {
  const { showToast } = useToast()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [expandedBooking, setExpandedBooking] = useState(null)

  useEffect(() => {
    apiGetAllBookings().then((data) => { setBookings(data || []); setIsLoading(false) }).catch(() => setIsLoading(false))
  }, [])

  async function handleStatus(id, status) {
    try {
      await apiUpdateBookingStatus(id, status)
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
      showToast('Booking status updated.', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error')
    }
  }

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    active: bookings.filter(b => ['confirmed', 'in_progress'].includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalGuests: bookings.reduce((s, b) => s + (parseInt(b.guestCount) || 0), 0),
  }), [bookings])

  const filtered = useMemo(() => {
    let result = bookings
    if (statusTab !== 'all') result = result.filter(b => b.status === statusTab)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(b =>
        (b.fullName || '').toLowerCase().includes(q) ||
        (b.email || '').toLowerCase().includes(q) ||
        (b.eventType || '').toLowerCase().includes(q) ||
        (b.eventLocation || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [bookings, statusTab, search])

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-pink border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Event Bookings</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage event bookings and catering requests</p>
        </div>
        <button onClick={() => { setIsLoading(true); apiGetAllBookings().then(d => { setBookings(d || []); setIsLoading(false) }) }}
          className="flex items-center gap-2 rounded-full border border-lilac-soft bg-white px-4 py-2 text-xs font-medium text-ink-muted hover:border-lilac hover:text-lilac-deep transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {[
          { label: 'Total Bookings', value: stats.total, icon: CalendarCheck, gradient: 'from-lilac/20 to-pink/10', iconColor: 'text-lilac-deep' },
          { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-50 to-orange-50', iconColor: 'text-amber-500' },
          { label: 'Active', value: stats.active, icon: CheckCircle, gradient: 'from-blue-50 to-indigo-50', iconColor: 'text-blue-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, gradient: 'from-green-50 to-emerald-50', iconColor: 'text-green-500' },
          { label: 'Total Guests', value: stats.totalGuests, icon: UsersIcon, gradient: 'from-purple-50 to-violet-50', iconColor: 'text-purple-500' },
        ].map(({ label, value, icon: Icon, gradient, iconColor }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl bg-gradient-to-br ${gradient} border border-lilac-soft/50 p-4`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 ${iconColor}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-ink">{value}</p>
                <p className="text-[11px] font-medium text-ink-muted">{label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter Tabs */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or event type..."
            className="w-full rounded-xl border border-lilac-soft bg-white py-2.5 pl-9 pr-4 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20 transition-all" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: 'all', label: 'All' },
            ...STATUSES.map(s => ({ key: s, label: STATUS_CONFIG[s].label })),
          ].map(({ key, label }) => {
            const count = key === 'all' ? bookings.length : bookings.filter(b => b.status === key).length
            return (
              <button key={key} onClick={() => setStatusTab(key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  statusTab === key
                    ? 'bg-brand-gradient text-white shadow-card'
                    : 'border border-lilac-soft bg-white text-ink-muted hover:border-lilac hover:text-lilac-deep'
                }`}>
                {label}
                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  statusTab === key ? 'bg-white/20 text-white' : 'bg-lilac-soft text-ink-muted'
                }`}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((b, i) => {
            const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
            const isExpanded = expandedBooking === b.id
            return (
              <motion.div key={b.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-lilac-soft bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{EVENT_ICONS[b.eventType] || '🎉'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-heading text-sm font-semibold text-ink capitalize">{b.eventType?.replace(/_/g, ' ')}</p>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${sc.color}`}>
                            {sc.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink-muted">{b.fullName} &middot; {b.email}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                          <span className="flex items-center gap-1"><CalendarCheck size={11} /> {fd(b.eventDate)}</span>
                          <span className="flex items-center gap-1"><MapPin size={11} /> {b.eventLocation}</span>
                          <span className="flex items-center gap-1"><UsersIcon size={11} /> {b.guestCount} guests</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setExpandedBooking(isExpanded ? null : b.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-lilac-soft/50 text-ink-muted hover:bg-lilac-soft transition-colors">
                      <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-lilac-soft bg-lilac-soft/10 p-4 sm:p-5 space-y-3">
                        {/* Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 rounded-lg bg-white p-3 border border-lilac-soft/50">
                            <Mail size={14} className="text-lilac-deep" />
                            <span className="text-xs text-ink">{b.email}</span>
                          </div>
                          {b.phone && (
                            <div className="flex items-center gap-2 rounded-lg bg-white p-3 border border-lilac-soft/50">
                              <Phone size={14} className="text-lilac-deep" />
                              <span className="text-xs text-ink">{b.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Special Requests */}
                        {b.specialRequests && (
                          <div className="rounded-lg bg-white p-3 border border-lilac-soft/50">
                            <p className="text-xs font-semibold text-ink mb-1">Special Requests</p>
                            <p className="text-xs text-ink-muted">{b.specialRequests}</p>
                          </div>
                        )}

                        {/* Status Update */}
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-semibold text-ink">Update Status:</p>
                          <select value={b.status} onChange={(e) => handleStatus(b.id, e.target.value)}
                            className="rounded-lg border border-lilac-soft bg-white px-3 py-2 text-xs font-medium text-ink focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20">
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <CalendarCheck size={48} className="mx-auto text-lilac-soft" />
            <p className="mt-3 text-sm font-medium text-ink-muted">
              {search ? 'No bookings match your search.' : statusTab !== 'all' ? `No ${statusTab} bookings.` : 'No bookings yet.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

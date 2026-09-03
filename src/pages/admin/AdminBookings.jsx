import { useState, useEffect } from 'react'
import { apiGetAllBookings, apiUpdateBookingStatus } from '../../utils/api.js'
import { useToast } from '../../components/ui/Toast.jsx'

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
const SC = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' }

export default function AdminBookings() {
  const { showToast } = useToast()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiGetAllBookings().then((data) => { setBookings(data); setIsLoading(false) }).catch(() => setIsLoading(false))
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

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })

  if (isLoading) return <div className="py-20 text-center text-ink-muted">Loading bookings...</div>

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink">Event Bookings</h1>
      <p className="mt-1 text-sm text-ink-muted">{bookings.length} total bookings</p>
      <div className="mt-4 space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-xl2 border border-lilac-soft bg-white p-4 shadow-soft sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink capitalize">{b.eventType?.replace('_', ' ')}</p>
                <p className="text-xs text-ink-muted">{b.fullName} &middot; {b.email}</p>
                <p className="text-xs text-ink-muted">{fd(b.eventDate)} &middot; {b.eventLocation} &middot; {b.guestCount} guests</p>
              </div>
              <span className={'rounded-full px-3 py-1 text-xs font-semibold capitalize ' + (SC[b.status] || 'bg-ink/5 text-ink-muted')}>{b.status?.replace('_', ' ')}</span>
            </div>
            <div className="mt-3 border-t border-lilac-soft pt-3">
              <select value={b.status} onChange={(e) => handleStatus(b.id, e.target.value)}
                className="rounded-full border border-lilac-soft bg-white px-3 py-1.5 text-xs font-medium text-ink focus:border-lilac focus:outline-none">
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No bookings yet.</p>}
      </div>
    </div>
  )
}

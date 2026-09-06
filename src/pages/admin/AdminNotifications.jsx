import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Package, CreditCard, Star, Mail, CalendarCheck, Heart, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NOTIF_ICONS = {
  order: Package,
  payment: CreditCard,
  review: Star,
  newsletter: Mail,
  booking: CalendarCheck,
  training: CalendarCheck,
  wishlist: Heart,
  security: Bell,
}

const NOTIF_COLORS = {
  order: 'bg-blue-100 text-blue-600',
  payment: 'bg-green-100 text-green-600',
  review: 'bg-yellow-100 text-yellow-600',
  newsletter: 'bg-purple-100 text-purple-600',
  booking: 'bg-pink-100 text-pink-600',
  training: 'bg-indigo-100 text-indigo-600',
  wishlist: 'bg-rose-100 text-rose-600',
  security: 'bg-red-100 text-red-600',
}

function timeAgo(date) {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now - d
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, read

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    const token = localStorage.getItem('bamzy_token')
    if (!token) return

    try {
      // Fetch recent activity from multiple sources
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
      const headers = { Authorization: 'Bearer ' + token }

      const [ordersRes, bookingsRes, trainingsRes, reviewsRes] = await Promise.allSettled([
        fetch(`${baseUrl}/admin/activity?limit=10`, { headers }).then(r => r.json()),
      ])

      const items = []

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
        const data = ordersRes.value.data
        ;(data.orders || []).forEach(o => {
          items.push({
            id: `order-${o.id}`,
            type: 'order',
            title: `New order #${o.orderNumber}`,
            message: `${o.customerName || 'Customer'} placed an order for ${Number(o.total || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}`,
            time: o.createdAt,
            read: false,
            link: '/admin/orders',
          })
        })
        ;(data.bookings || []).forEach(b => {
          items.push({
            id: `booking-${b.id}`,
            type: 'booking',
            title: `New ${b.eventType?.replace('_', ' ') || 'event'} booking`,
            message: `${b.fullName || 'Customer'} booked an event`,
            time: b.createdAt,
            read: false,
            link: '/admin/bookings',
          })
        })
        ;(data.trainings || []).forEach(t => {
          items.push({
            id: `training-${t.id}`,
            type: 'training',
            title: `Training registration`,
            message: `${t.fullName || 'Customer'} registered for ${t.trainingTitle || 'a training'}`,
            time: t.createdAt,
            read: false,
            link: '/admin/trainings',
          })
        })
        ;(data.reviews || []).forEach(r => {
          items.push({
            id: `review-${r.id}`,
            type: 'review',
            title: `New review from ${r.customerName || 'Customer'}`,
            message: `${'⭐'.repeat(r.rating || 0)} — "${(r.text || '').slice(0, 60)}${r.text?.length > 60 ? '...' : ''}"`,
            time: r.createdAt,
            read: r.isApproved,
            link: '/admin/reviews',
          })
        })
      }

      // Sort by time, newest first
      items.sort((a, b) => new Date(b.time) - new Date(a.time))
      setNotifications(items)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }

  function markAsRead(id) {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-pink border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Notifications</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-full border border-lilac-soft bg-white px-4 py-2 text-sm font-medium text-ink-muted hover:bg-lilac-soft/50 transition-colors"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { label: 'All', value: 'all', count: notifications.length },
          { label: 'Unread', value: 'unread', count: unreadCount },
          { label: 'Read', value: 'read', count: notifications.length - unreadCount },
        ].map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === value
                ? 'bg-brand-gradient text-white shadow-xs'
                : 'bg-white text-ink-muted border border-gray-100 hover:bg-lilac-soft/30'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-gray-100 bg-white p-12 text-center"
            >
              <Bell size={40} className="mx-auto text-ink-muted/30" />
              <p className="mt-4 text-sm font-medium text-ink-muted">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="mt-1 text-xs text-ink-muted/60">
                Notifications for new orders, bookings, reviews, and more will appear here.
              </p>
            </motion.div>
          ) : (
            filtered.map((notif, i) => {
              const Icon = NOTIF_ICONS[notif.type] || Bell
              const colorClass = NOTIF_COLORS[notif.type] || 'bg-gray-100 text-gray-600'
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => {
                    markAsRead(notif.id)
                    if (notif.link) window.location.href = notif.link
                  }}
                  className={`flex items-start gap-4 rounded-xl border p-4 transition-all cursor-pointer hover:shadow-sm ${
                    notif.read
                      ? 'border-gray-100 bg-white'
                      : 'border-lilac-soft bg-lilac-soft/20'
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${notif.read ? 'text-ink-muted' : 'text-ink'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-pink shrink-0" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted line-clamp-2">{notif.message}</p>
                    <p className="mt-1 text-[10px] text-ink-muted/60">{timeAgo(notif.time)}</p>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(notif.id) }}
                      className="shrink-0 rounded-lg p-2 text-ink-muted hover:bg-lilac-soft/30 transition-colors"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

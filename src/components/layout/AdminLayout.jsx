import { NavLink, Outlet, Link, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  CalendarCheck,
  GraduationCap,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  PackageSearch,
  Tags,
  Star,
  Mail,
  MapPin,
  HelpCircle,
  Bell,
  Heart,
} from 'lucide-react'
import { useState, useEffect, useRef, Component } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getImgUrl } from '../../utils/api.js'
import LoadingSpinner from '../ui/LoadingSpinner.jsx'

/* ── Error Boundary for admin pages ── */
class AdminPageError extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, info) { console.error('Admin page error:', error, info?.componentStack) }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center max-w-md">
            <span className="text-4xl">⚠️</span>
            <h2 className="mt-4 font-heading text-xl font-bold text-ink">Something went wrong</h2>
            <p className="mt-2 text-sm text-ink-muted">This page encountered an error. Try refreshing.</p>
            <div className="mt-4 flex gap-3 justify-center">
              <button onClick={() => this.setState({ hasError: false })}
                className="rounded-full border border-lilac-soft bg-white px-5 py-2.5 text-sm font-semibold text-ink-muted hover:bg-lilac-soft">Go Back</button>
              <button onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
                className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white">Reload Page</button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const NAV_GROUPS = [
  {
    items: [
      { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Orders', to: '/admin/orders', icon: ClipboardList },
      { label: 'Products', to: '/admin/products', icon: Package },
      { label: 'Categories', to: '/admin/categories', icon: Tags },
      { label: 'Customers', to: '/admin/customers', icon: Users },
      { label: 'Payments', to: '/admin/payments', icon: CreditCard },
      { label: 'Reviews', to: '/admin/reviews', icon: Star },
      { label: 'Newsletter', to: '/admin/newsletter', icon: Mail },
      { label: 'FAQ', to: '/admin/faq', icon: HelpCircle },
      { label: 'Wishlists', to: '/admin/wishlists', icon: Heart },
    ],
  },
  {
    label: 'Bookings',
    items: [
      { label: 'Events & Bookings', to: '/admin/bookings', icon: CalendarCheck },
      { label: 'Trainings', to: '/admin/trainings', icon: GraduationCap },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
      { label: 'Inventory', to: '/admin/products', icon: PackageSearch },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Delivery Zones', to: '/admin/delivery-zones', icon: MapPin },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
    ],
  },
]

/* ── Notification Bell with Dropdown ── */
function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [notifications, setNotifications] = useState([])
  const dropdownRef = useRef(null)
  const unreadCount = notifications.filter(n => !n.read).length

  const NOTIF_ICONS = { order: '📦', booking: '🎉', training: '📚', review: '⭐', payment: '💳', newsletter: '📧', security: '🛡️' }

  useEffect(() => {
    const token = localStorage.getItem('bamzy_token')
    if (!token) return
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/admin/activity?limit=10', {
      headers: { Authorization: 'Bearer ' + token }
    }).then(r => r.json()).then(d => {
      if (d.success && d.data) {
        const items = []
        ;(d.data.orders || []).forEach(o => {
          items.push({ id: 'order-' + o.id, type: 'order', title: `New order #${o.orderNumber}`, message: `${o.customerName || 'Customer'} — ₦${Number(o.total || 0).toLocaleString()}`, time: o.createdAt, read: false, link: '/admin/orders' })
        })
        ;(d.data.bookings || []).forEach(b => {
          items.push({ id: 'booking-' + b.id, type: 'booking', title: `New ${b.eventType?.replace(/_/g, ' ') || 'event'} booking`, message: `${b.fullName || 'Customer'} booked an event`, time: b.createdAt, read: false, link: '/admin/bookings' })
        })
        ;(d.data.trainings || []).forEach(t => {
          items.push({ id: 'training-' + t.id, type: 'training', title: 'Training registration', message: `${t.fullName || 'Customer'} registered for ${t.trainingTitle || 'a training'}`, time: t.createdAt, read: false, link: '/admin/trainings' })
        })
        ;(d.data.reviews || []).forEach(r => {
          items.push({ id: 'review-' + r.id, type: 'review', title: `New review from ${r.customerName || 'Customer'}`, message: `${'⭐'.repeat(r.rating || 0)} — "${(r.text || '').slice(0, 50)}${r.text?.length > 50 ? '...' : ''}"`, time: r.createdAt, read: !!r.isApproved, link: '/admin/reviews' })
        })
        items.sort((a, b) => new Date(b.time) - new Date(a.time))
        setNotifications(items)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function markAsRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function timeAgo(date) {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[340px] sm:w-96 max-h-[480px] overflow-hidden rounded-2xl border border-white/10 bg-[#1e1432] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-white/80" />
              <p className="text-base font-bold text-white">Notifications</p>
              {unreadCount > 0 && (
                <span className="rounded-full bg-pink/20 px-2 py-0.5 text-xs font-semibold text-pink">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm text-pink hover:text-pink/80 font-medium transition-colors">Mark all read</button>
            )}
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Bell size={36} className="mx-auto text-white/20" />
                <p className="mt-3 text-sm text-white/50">No notifications yet</p>
                <p className="mt-1 text-xs text-white/30">New orders and bookings will appear here</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => {
                const isExpanded = expandedId === n.id
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id)
                      setExpandedId(isExpanded ? null : n.id)
                    }}
                    className={`border-b border-white/5 px-5 py-4 cursor-pointer transition-all ${
                      !n.read ? 'bg-white/5 hover:bg-white/8' : 'hover:bg-white/3'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5 shrink-0">{NOTIF_ICONS[n.type] || '📢'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-semibold leading-tight ${n.read ? 'text-white/60' : 'text-white'}`}>{n.title}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {!n.read && <span className="h-2 w-2 rounded-full bg-pink" />}
                            <span className="text-xs text-white/40 whitespace-nowrap">{timeAgo(n.time)}</span>
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-white/70 leading-relaxed line-clamp-2">{n.message}</p>
                        {isExpanded && (
                          <div className="mt-3 rounded-lg bg-white/5 p-3 border border-white/5">
                            <p className="text-sm text-white/80 leading-relaxed">{n.message}</p>
                            <p className="mt-2 text-xs text-white/40">
                              {new Date(n.time).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                            {n.link && (
                              <button onClick={(e) => { e.stopPropagation(); setOpen(false); window.location.href = n.link }}
                                className="mt-3 inline-flex items-center gap-1 rounded-full bg-pink/20 px-3 py-1.5 text-xs font-semibold text-pink hover:bg-pink/30 transition-colors">
                                View details →
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <Link to="/admin/notifications" onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 border-t border-white/10 px-5 py-3.5 text-sm font-semibold text-pink hover:bg-white/5 transition-colors">
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  )
}

function SidebarContent({ user, logout, onClose }) {
  const [imgError, setImgError] = useState(false)
  const hasAvatar = user?.avatar_url && !imgError

  return (
    <>
      {/* Logo */}
      <Link to="/" className="mb-6 flex items-center gap-3 px-1">
        <img src="/logo.jpg" alt="Bamzy" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/20" />
        <div>
          <p className="text-sm font-bold leading-tight text-white">Bamzy</p>
          <p className="text-[10px] text-white/50">Cakes & Confectionery</p>
        </div>
      </Link>

      {/* Admin Info + Notification Bell */}
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-white/5 p-3">
        {hasAvatar ? (
          <img src={getImgUrl(user.avatar_url)} alt={user.full_name}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/10"
            onError={() => setImgError(true)} />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink to-lilac text-sm font-bold text-white">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white">{user?.full_name}</p>
          <p className="truncate text-[10px] text-white/40">{user?.email}</p>
        </div>
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to + label}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ' +
                    (isActive
                      ? 'bg-gradient-to-r from-pink to-lilac text-white shadow-lg shadow-pink/20'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80')
                  }
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <Link to="/"
          className="flex items-center gap-2 px-3 py-2 text-[12px] text-white/40 transition-colors hover:text-white/70">
          ← Back to customer site
        </Link>
        <button onClick={() => { logout(); window.location.href = '/' }}
          className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-white/40 transition-colors hover:text-white/70">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isLoading) return <LoadingSpinner label="Loading..." />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mt-4 font-heading text-2xl font-bold text-ink">Access Denied</h1>
          <p className="mt-2 text-ink-muted">You need admin privileges to view this page.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/" className="rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white">Go to Shop</Link>
            <button onClick={() => { logout(); window.location.href = '/admin/login' }}
              className="rounded-lg border border-lilac-soft bg-white px-6 py-3 text-sm font-medium text-ink-muted">Switch Account</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-gradient-to-b from-[#1a1025] via-[#201535] to-[#1a1025] p-4 lg:flex">
        <SidebarContent user={user} logout={logout} />
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 overflow-x-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-ink">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
          <span className="font-heading text-base font-semibold">Bamzy Admin</span>
          <div className="w-6" />
        </header>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col bg-gradient-to-b from-[#1a1025] via-[#201535] to-[#1a1025] p-4 overflow-y-auto">
              <div className="flex justify-end mb-2">
                <button onClick={() => setSidebarOpen(false)} className="text-white/50 hover:text-white">✕</button>
              </div>
              <SidebarContent user={user} logout={logout} onClose={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main Content with Error Boundary */}
        <main className="p-4 sm:p-6 lg:p-8">
          <AdminPageError key={window.location.pathname}>
            <Outlet />
          </AdminPageError>
        </main>
      </div>
    </div>
  )
}

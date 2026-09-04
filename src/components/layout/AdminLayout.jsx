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
} from 'lucide-react'
import { useState, useEffect, Component } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getImgUrl } from '../../utils/api.js'
import LoadingSpinner from '../ui/LoadingSpinner.jsx'

/* ── Error Boundary for admin pages ── */
class AdminPageError extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center max-w-md">
            <span className="text-4xl">⚠️</span>
            <h2 className="mt-4 font-heading text-xl font-bold text-ink">Something went wrong</h2>
            <p className="mt-2 text-sm text-ink-muted">This page encountered an error. Try refreshing.</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
              className="mt-4 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white">Reload Page</button>
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

function SidebarContent({ user, logout }) {
  const [imgError, setImgError] = useState(false)
  const [notifications, setNotifications] = useState([])
  const hasAvatar = user?.avatar_url && !imgError

  useEffect(() => {
    const token = localStorage.getItem('bamzy_token')
    if (!token) return
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/admin/activity?limit=5', {
      headers: { Authorization: 'Bearer ' + token }
    }).then(r => r.json()).then(d => {
      if (d.success && d.data) {
        const items = []
        ;(d.data.orders || []).slice(0, 3).forEach(o => {
          items.push({ id: o.id, text: `New order #${o.orderNumber} from ${o.customerName}`, time: o.createdAt, type: 'order' })
        })
        ;(d.data.bookings || []).slice(0, 2).forEach(b => {
          items.push({ id: b.id, text: `Booking: ${b.eventType} by ${b.fullName}`, time: b.createdAt, type: 'booking' })
        })
        setNotifications(items)
      }
    }).catch(() => {})
  }, [])

  const unreadCount = notifications.length

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

      {/* Admin Info */}
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
        {/* Notification Bell */}
        <Link to="/admin/analytics" className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>
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
              <SidebarContent user={user} logout={logout} />
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

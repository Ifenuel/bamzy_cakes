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
  FileText,
  PackageSearch,
  Tags,
  Star,
  Mail,
  MapPin,
  HelpCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getImgUrl } from '../../utils/api.js'
import LoadingSpinner from '../ui/LoadingSpinner.jsx'

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
    items: [
      { label: 'Delivery Zones', to: '/admin/delivery-zones', icon: MapPin },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
    ],
  },
]

function SidebarContent({ user, logout }) {
  const [imgError, setImgError] = useState(false)
  const hasAvatar = user?.avatar_url && !imgError

  return (
    <>
      {/* Logo */}
      <Link to="/" className="mb-8 flex items-center gap-3 px-1">
        <img src="/logo.jpg" alt="Bamzy" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/20" />
        <div>
          <p className="text-sm font-bold leading-tight text-white">Bamzy</p>
          <p className="text-[10px] text-white/50">Cakes & Confectionery</p>
        </div>
      </Link>

      {/* Admin Info with Avatar */}
      <div className="mb-6 flex items-center gap-3 rounded-lg bg-white/5 p-3">
        {hasAvatar ? (
          <img
            src={getImgUrl(user.avatar_url)}
            alt={user.full_name}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/10"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-white">{user?.full_name}</p>
          <p className="truncate text-[10px] text-white/40">{user?.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5">
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ' +
                    (isActive
                      ? 'bg-brand-gradient text-white shadow-sm'
                      : 'text-white/60 hover:bg-white/5 hover:text-white')
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
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-[12px] text-white/40 transition-colors hover:text-white/70"
        >
          ← Back to customer site
        </Link>
        <button
          onClick={() => {
            logout()
            window.location.href = '/'
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-white/40 transition-colors hover:text-white/70"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth()

  if (isLoading) {
    return <LoadingSpinner label="Loading..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mt-4 font-heading text-2xl font-bold text-ink">Access Denied</h1>
          <p className="mt-2 text-ink-muted">You need admin privileges to view this page.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Logged in as: {user?.full_name} ({user?.role})
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/"
              className="rounded-lg bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card hover:shadow-glow"
            >
              Go to Shop
            </Link>
            <button
              onClick={() => {
                logout()
                window.location.href = '/admin/login'
              }}
              className="rounded-lg border border-lilac-soft bg-white px-6 py-3 text-sm font-medium text-ink-muted hover:border-pink hover:text-pink"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col bg-[#1a1025] p-4 sm:flex lg:w-64">
        <SidebarContent user={user} logout={logout} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:hidden">
          <span className="font-heading text-base font-semibold">Bamzy Admin</span>
          <span className="text-xs text-ink-muted">{user?.full_name}</span>
        </header>

        {/* Mobile Sidebar Overlay (simplified) */}
        <div className="hidden max-sm:absolute max-sm:inset-0 max-sm:z-50 max-sm:flex max-sm:flex-col max-sm:bg-[#1a1025] max-sm:p-4">
          <SidebarContent user={user} logout={logout} />
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

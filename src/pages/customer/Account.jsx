import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ClipboardList, CalendarCheck, GraduationCap,
  Heart, UserCircle, Settings, LogOut, Menu, X,
  ShoppingBag, TrendingUp, ChevronRight, Camera, Check, Bell, Trash2, AlertTriangle, Save, Mail, Phone
} from 'lucide-react'
import PageContainer from '../../components/layout/PageContainer.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { apiGetAccount, apiUploadAvatar, apiUpdateProfile, apiDeleteAccount, apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead, getImgUrl } from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'
import { useToast } from '../../components/ui/Toast.jsx'

/* ─── Sidebar tabs ─── */
const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'orders', label: 'My Orders', icon: ClipboardList },
  { key: 'bookings', label: 'My Bookings', icon: CalendarCheck },
  { key: 'trainings', label: 'My Trainings', icon: GraduationCap },
  { key: 'favourites', label: 'Favourites', icon: Heart },
  { key: 'profile', label: 'Profile', icon: UserCircle },
  { key: 'settings', label: 'Settings', icon: Settings },
]

const STATUS_BADGE = {
  pending: 'bg-warning-soft text-warning',
  confirmed: 'bg-success-soft text-success',
  preparing: 'bg-info-soft text-info',
  ready: 'bg-success-soft text-success',
  out_for_delivery: 'bg-info-soft text-info',
  completed: 'bg-success-soft text-success',
  cancelled: 'bg-error-soft text-error',
  in_progress: 'bg-info-soft text-info',
}

export default function Account() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [orders, setOrders] = useState([])
  const [bookings, setBookings] = useState([])
  const [trainings, setTrainings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)

  /* ─── Fetch account data ─── */
  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    let ok = true
    setIsLoading(true)
    apiGetAccount()
      .then((data) => {
        if (ok) {
          setOrders(data.orders || [])
          setBookings(data.bookings || [])
          setTrainings(data.trainingRegistrations || [])
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (ok) {
          setError(err.message || 'Failed to load account')
          setIsLoading(false)
        }
      })
    return () => { ok = false }
  }, [isAuthenticated, authLoading])

  /* ─── Derived data ─── */
  const insights = useMemo(() => {
    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.orderStatus === 'completed').length
    const totalSpent = orders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0)
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    const ordersThisMonth = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    }).length
    const upcomingBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length
    const trainingCount = trainings.length
    // Favourite category
    const catMap = {}
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const cat = item.categoryName || 'Other'
        catMap[cat] = (catMap[cat] || 0) + (item.quantity || 1)
      })
    })
    const favCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    return { totalOrders, completedOrders, totalSpent, ordersThisMonth, upcomingBookings, trainingCount, favCategory }
  }, [orders, bookings, trainings])

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' })

  function handleLogout() {
    logout()
    window.location.href = '/'
  }

  /* ─── Loading / Auth guard ─── */
  if (authLoading) return <LoadingSpinner label="Loading your account..." />
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient-soft">
            <ShoppingBag size={32} className="text-pink" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink">Sign in to My Bamzy</h1>
          <p className="mt-2 max-w-sm mx-auto text-ink-muted">
            Your orders, bookings, and favourite treats — all in one place.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" className="inline-flex items-center rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow">
              Sign In
            </Link>
            <Link to="/register" className="inline-flex items-center rounded-full border border-lilac-deep/30 px-6 py-3 text-sm font-semibold text-lilac-deep transition-colors hover:bg-lilac-soft">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) return <LoadingSpinner label="Loading your Bamzy..." />

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-ink">Something went wrong</h1>
          <p className="mt-2 text-ink-muted">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there'

  /* ─── Sidebar content per tab ─── */
  function renderContent() {
    switch (tab) {
      case 'overview': return <OverviewTab orders={orders} bookings={bookings} trainings={trainings} insights={insights} navigate={navigate} fd={fd} />
      case 'orders': return <OrdersTab orders={orders} fd={fd} />
      case 'bookings': return <BookingsTab bookings={bookings} navigate={navigate} fd={fd} />
      case 'trainings': return <TrainingsTab trainings={trainings} navigate={navigate} fd={fd} />
      case 'favourites': return <FavouritesTab />
      case 'profile': return <ProfileTab user={user} />
      case 'settings': return <SettingsTab user={user} onSave={(data) => apiUpdateProfile(data)} />
      default: return null
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <PageContainer className="py-6 sm:py-10">
        {/* ─── Mobile header ─── */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex items-center gap-2 rounded-xl border border-lilac-soft bg-white px-4 py-2.5 text-sm font-medium text-ink"
          >
            {mobileMenu ? <X size={18} /> : <Menu size={18} />}
            <span>My Bamzy</span>
          </button>
        </div>

        <div className="flex gap-8">
          {/* ─── Sidebar (desktop) ─── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              {/* User card */}
              <div className="mb-6 rounded-2xl bg-brand-gradient-subtle p-5">
                <div className="flex items-center gap-3">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-white" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white font-heading text-lg font-bold">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{user?.full_name}</p>
                    <p className="text-xs text-ink-muted truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="space-y-1">
                {TABS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => { setTab(key); setMobileMenu(false) }}
                    className={
                      'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ' +
                      (tab === key
                        ? 'bg-brand-gradient text-white shadow-card'
                        : 'text-ink-muted hover:bg-lilac-soft/60 hover:text-ink')
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
                <hr className="my-3 border-lilac-soft" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-error-soft hover:text-error"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* ─── Mobile menu ─── */}
          <AnimatePresence>
            {mobileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="fixed inset-x-0 top-16 z-50 bg-white border-b border-lilac-soft shadow-elevated lg:hidden"
              >
                <nav className="mx-auto max-w-7xl p-4 space-y-1">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => { setTab(key); setMobileMenu(false) }}
                      className={
                        'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ' +
                        (tab === key
                          ? 'bg-brand-gradient text-white'
                          : 'text-ink hover:bg-lilac-soft/60')
                      }
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-error hover:bg-error-soft"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Main content ─── */}
          <div className="flex-1 min-w-0">
            {/* Welcome header */}
            {tab === 'overview' && (
              <div className="mb-6">
                <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
                  Welcome back, {firstName} 💗
                </h1>
                <p className="mt-1 text-ink-muted">
                  Here&apos;s what&apos;s happening with your Bamzy orders and bookings.
                </p>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════════ */
function OverviewTab({ orders, bookings, trainings, insights, navigate, fd }) {
  const cards = [
    { label: 'My Orders', value: insights.totalOrders, icon: ClipboardList, color: 'from-lilac to-lilac-deep', action: 'View all orders →', tab: 'orders' },
    { label: 'Upcoming Bookings', value: insights.upcomingBookings, icon: CalendarCheck, color: 'from-pink to-pink/80', action: 'View bookings →', tab: 'bookings' },
    { label: 'Training Registrations', value: insights.trainingCount, icon: GraduationCap, color: 'from-info to-info/80', action: 'View trainings →', tab: 'trainings' },
    { label: 'Total Spent', value: formatNaira(insights.totalSpent), icon: TrendingUp, color: 'from-success to-success/80', action: null, tab: null },
  ]

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-lilac-soft/60 bg-white p-4 shadow-xs sm:p-5 cursor-pointer hover:shadow-soft transition-shadow"
            onClick={() => c.tab && navigate('/account')}
          >
            <div className={'mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ' + c.color + ' text-white'}>
              <c.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-ink">{c.value}</p>
            <p className="text-xs text-ink-muted mt-1">{c.label}</p>
            {c.action && <p className="mt-2 text-xs font-medium text-pink">{c.action}</p>}
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-ink">Recent Orders</h2>
          {orders.length > 0 && (
            <button onClick={() => navigate('/account')} className="text-xs font-medium text-pink hover:underline">
              View all <ChevronRight size={14} className="inline" />
            </button>
          )}
        </div>
        {orders.length === 0 ? (
          <EmptyState
            emoji="🧁"
            text="No orders yet."
            subtext="Your first Bamzy treat is waiting."
            cta={{ label: "Shop Today's Treats", to: '/shop' }}
          />
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((o) => (
              <OrderCard key={o.id} order={o} fd={fd} compact />
            ))}
          </div>
        )}
      </div>

      {/* Bookings + Trainings side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-ink">Upcoming Bookings</h2>
            {bookings.length > 0 && <span className="text-xs font-medium text-pink">{bookings.length} total</span>}
          </div>
          {bookings.length === 0 ? (
            <EmptyState
              emoji="🎉"
              text="No upcoming bookings."
              subtext="Plan something special."
              cta={{ label: 'Plan an Event', to: '/events/book' }}
            />
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 3).map((b) => (
                <div key={b.id} className="rounded-xl border border-lilac-soft bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink capitalize">{(b.eventType || '').replace(/_/g, ' ')}</p>
                      <p className="text-xs text-ink-muted">{fd(b.eventDate)} · {b.guestCount || '—'} guests</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Training Registrations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-ink">Training Registrations</h2>
            {trainings.length > 0 && <span className="text-xs font-medium text-pink">{trainings.length} total</span>}
          </div>
          {trainings.length === 0 ? (
            <EmptyState
              emoji="📚"
              text="No training registrations yet."
              subtext="Learn to bake like a pro."
              cta={{ label: 'Explore Trainings', to: '/trainings' }}
            />
          ) : (
            <div className="space-y-3">
              {trainings.slice(0, 3).map((t) => (
                <div key={t.id} className="rounded-xl border border-lilac-soft bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">{t.trainingTitle}</p>
                      <p className="text-xs text-ink-muted">{t.numberOfStudents} student(s) · {fd(t.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-pink">{formatNaira(t.amount)}</span>
                      <p className="text-xs text-ink-muted capitalize">{t.registrationStatus}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Insights card */}
      {insights.totalOrders > 0 && (
        <div className="rounded-2xl bg-brand-gradient-subtle p-6">
          <h2 className="font-heading text-lg font-bold text-ink mb-3">Your Bamzy Insights</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InsightItem label="Orders this month" value={insights.ordersThisMonth} />
            <InsightItem label="Total orders" value={insights.totalOrders} />
            <InsightItem label="Favourite category" value={insights.favCategory || '—'} />
            <InsightItem label="Total spent" value={formatNaira(insights.totalSpent)} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   ORDERS TAB
   ═══════════════════════════════════════════════════════ */
function OrdersTab({ orders, fd }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-ink mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <EmptyState
          emoji="📦"
          text="No orders yet."
          subtext="Your first Bamzy treat is waiting for you."
          cta={{ label: "Explore Today's Treats", to: '/shop' }}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} fd={fd} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCard({ order: o, fd, compact }) {
  return (
    <a
      href={'/order/' + o.id}
      className="block rounded-xl border border-lilac-soft bg-white p-4 shadow-xs hover:shadow-soft hover:border-pink/30 transition-all sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ink">#{o.orderNumber}</p>
          <p className="text-xs text-ink-muted">{fd(o.createdAt)}</p>
        </div>
        <StatusBadge status={o.orderStatus} />
      </div>
      {!compact && (
        <div className="mt-3 text-sm text-ink-muted">
          {(o.items || []).slice(0, 2).map((item, i) => (
            <span key={i}>
              {item.productName || item.productNameSnapshot || 'Item'} × {item.quantity}
              {i < Math.min(o.items.length, 2) - 1 ? ', ' : ''}
            </span>
          ))}
          {o.items?.length > 2 && <span className="text-ink-light"> +{o.items.length - 2} more</span>}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-lilac-soft/60 pt-3">
        <span className="text-xs text-ink-muted capitalize">{o.deliveryMethod}</span>
        <span className="text-sm font-bold text-pink">{formatNaira(o.total)}</span>
      </div>
    </a>
  )
}

/* ═══════════════════════════════════════════════════════
   BOOKINGS TAB
   ═══════════════════════════════════════════════════════ */
function BookingsTab({ bookings, fd }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-ink mb-4">My Bookings</h2>
      {bookings.length === 0 ? (
        <EmptyState
          emoji="🎉"
          text="No bookings yet."
          subtext="Planning an event? Let's make it special."
          cta={{ label: 'Book an Event', to: '/events/book' }}
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-lilac-soft bg-white p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-ink capitalize">{(b.eventType || '').replace(/_/g, ' ')}</p>
                  <p className="text-xs text-ink-muted">{fd(b.eventDate)} · {b.eventLocation}</p>
                  <p className="text-xs text-ink-muted mt-1">{b.guestCount} guests · {b.fullName}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              {b.servicesRequested && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(Array.isArray(b.servicesRequested) ? b.servicesRequested : [b.servicesRequested]).map((s, i) => (
                    <span key={i} className="rounded-full bg-lilac-soft/60 px-3 py-1 text-xs font-medium text-lilac-deep capitalize">
                      {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   TRAININGS TAB
   ═══════════════════════════════════════════════════════ */
function TrainingsTab({ trainings, fd }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-ink mb-4">My Trainings</h2>
      {trainings.length === 0 ? (
        <EmptyState
          emoji="📚"
          text="No training registrations yet."
          subtext="Learn the art of baking with Bamzy."
          cta={{ label: 'Explore Trainings', to: '/trainings' }}
        />
      ) : (
        <div className="space-y-3">
          {trainings.map((t) => (
            <div key={t.id} className="rounded-xl border border-lilac-soft bg-white p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-ink">{t.trainingTitle}</p>
                  <p className="text-xs text-ink-muted">{t.numberOfStudents} student(s) · Registered {fd(t.createdAt)}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-pink">{formatNaira(t.amount)}</span>
                  <StatusBadge status={t.registrationStatus} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   FAVOURITES TAB (placeholder — no backend yet)
   ═══════════════════════════════════════════════════════ */
function FavouritesTab() {
  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-ink mb-4">My Favourites</h2>
      <EmptyState
        emoji="💗"
        text="No favourites yet."
        subtext="Browse our treats and save your favourites here."
        cta={{ label: 'Browse Treats', to: '/shop' }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   PROFILE TAB
   ═══════════════════════════════════════════════════════ */
function ProfileTab({ user }) {
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '')
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      alert('Image must be under 3MB')
      return
    }
    setUploading(true)
    try {
      const result = await apiUploadAvatar(file)
      const imageUrl = getImgUrl(result.imageUrl)
      setAvatarPreview(imageUrl)
      // Save avatar to profile
      await apiUpdateProfile({ avatar_url: result.imageUrl })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    try {
      await apiUpdateProfile({
        full_name: form.full_name,
        phone: form.phone,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(err.message || 'Failed to save')
    }
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-bold text-ink mb-6">Profile</h2>
      <div className="max-w-lg">
        {/* Avatar with upload */}
        <div className="mb-6 flex items-center gap-5">
          <div className="relative group">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-lilac-soft" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient text-3xl font-heading font-bold text-white">
                {(user?.full_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={20} className="text-white" />
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-ink">{user?.full_name}</p>
            <p className="text-sm text-ink-muted">{user?.email}</p>
            <p className="mt-1 text-xs text-ink-light">Click photo to change</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Full Name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full rounded-xl border border-lilac-soft bg-white px-4 py-3 text-sm text-ink focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-lilac-soft bg-white px-4 py-3 text-sm text-ink bg-lilac-50/50 cursor-not-allowed"
              disabled
            />
            <p className="mt-1 text-xs text-ink-light">Email cannot be changed</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Phone</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-lilac-soft bg-white px-4 py-3 text-sm text-ink focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
            />
          </div>

          <button
            onClick={handleSave}
            className="rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card hover:shadow-glow transition-all"
          >
            {saved ? <><Check size={16} className="inline mr-1" /> Saved</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   SETTINGS TAB
   ═══════════════════════════════════════════════════════ */
function SettingsTab({ user, onSave }) {
  const { showToast } = useToast()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [profileForm, setProfileForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    apiGetNotifications().then(setNotifications).catch(() => {})
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  async function handleSaveProfile() {
    setIsSavingProfile(true)
    try {
      await onSave(profileForm)
      showToast('Profile updated!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error')
    }
    setIsSavingProfile(false)
  }

  async function handleDeleteAccount() {
    if (!deleteReason.trim()) { showToast('Please provide a reason', 'error'); return }
    setIsDeleting(true)
    try {
      await apiDeleteAccount(deleteReason)
      showToast('Account deleted. We are sorry to see you go.', 'success')
      logout()
      window.location.href = '/'
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error')
    }
    setIsDeleting(false)
  }

  async function handleMarkAllRead() {
    try {
      await apiMarkAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {}
  }

  async function handleMarkRead(id) {
    try {
      await apiMarkNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch {}
  }

  const ic = 'w-full rounded-xl border border-lilac-soft bg-white px-4 py-2.5 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20'

  return (
    <div className="space-y-8">
      <h2 className="font-heading text-xl font-bold text-ink">Settings</h2>

      {/* Profile Section */}
      <div className="rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-4">
          <UserCircle size={18} className="text-lilac" />
          <h3 className="font-heading text-base font-semibold text-ink">Edit Profile</h3>
        </div>
        <div className="space-y-3 max-w-md">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Full Name</label>
            <input value={profileForm.full_name} onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Phone</label>
            <input value={profileForm.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink">Email</label>
            <input value={user?.email} disabled className={ic + ' bg-gray-50 text-ink-muted cursor-not-allowed'} />
            <p className="text-[10px] text-ink-light mt-1">Email cannot be changed</p>
          </div>
          <button onClick={handleSaveProfile} disabled={isSavingProfile}
            className="flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow disabled:opacity-50">
            <Save size={16} /> {isSavingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-lilac" />
            <h3 className="font-heading text-base font-semibold text-ink">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-pink px-2 py-0.5 text-[10px] font-bold text-white">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-xs font-medium text-pink hover:underline">Mark all read</button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">No notifications yet.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div key={n.id} onClick={() => !n.isRead && handleMarkRead(n.id)}
                className={`flex items-start gap-3 rounded-lg p-3 transition-colors cursor-pointer ${n.isRead ? 'bg-gray-50' : 'bg-lilac-soft/40 hover:bg-lilac-soft/60'}`}>
                <span className="mt-0.5 text-lg">{n.type === 'order' ? '📦' : n.type === 'booking' ? '🎉' : '📢'}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${n.isRead ? 'font-medium text-ink-muted' : 'font-semibold text-ink'}`}>{n.title}</p>
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-ink-light mt-1">{new Date(n.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-pink mt-1" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="rounded-xl border border-lilac-soft bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <Mail size={18} className="text-lilac" />
          <h3 className="font-heading text-base font-semibold text-ink">Account</h3>
        </div>
        <p className="text-sm text-ink-muted">{user?.email}</p>
        <p className="text-xs text-ink-light mt-1 capitalize">Role: {user?.role || 'customer'}</p>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border-2 border-error/30 bg-error-soft/20 p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-error" />
          <h3 className="font-heading text-base font-semibold text-error">Danger Zone</h3>
        </div>
        <p className="text-sm text-ink-muted mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
        <button onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 rounded-full border-2 border-error bg-white px-5 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-error hover:text-white">
          <Trash2 size={16} /> Delete My Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4" onClick={() => setShowDeleteModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl bg-white p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-soft"><Trash2 size={18} className="text-error" /></div>
              <div>
                <h3 className="font-heading text-lg font-bold text-ink">Delete Account</h3>
                <p className="text-xs text-ink-muted">This action is permanent and cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-ink-muted mb-3">Please tell us why you are leaving (this helps us improve):</p>
            <textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} rows={3}
              className="w-full resize-none rounded-xl border border-lilac-soft px-4 py-3 text-sm focus:border-error focus:outline-none focus:ring-2 focus:ring-error/20"
              placeholder="e.g. I no longer need the service, found an alternative..." />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-full border border-lilac-soft px-4 py-2.5 text-sm font-medium text-ink-muted hover:bg-lilac-soft transition-colors">Cancel</button>
              <button onClick={handleDeleteAccount} disabled={isDeleting || !deleteReason.trim()}
                className="flex-1 rounded-full bg-error px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed">
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Shared Components ─── */
function StatusBadge({ status }) {
  const s = (status || 'pending').toLowerCase().replace(/\s+/g, '_')
  return (
    <span className={'rounded-full px-3 py-1 text-xs font-semibold capitalize ' + (STATUS_BADGE[s] || 'bg-ink/5 text-ink-muted')}>
      {(status || 'pending').replace(/_/g, ' ')}
    </span>
  )
}

function InsightItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-base font-bold text-ink">{value}</p>
    </div>
  )
}

function EmptyState({ emoji, text, subtext, cta }) {
  return (
    <div className="rounded-2xl border border-dashed border-lilac-soft bg-lilac-50/40 p-8 text-center">
      <p className="text-4xl mb-3">{emoji}</p>
      <p className="font-heading text-base font-bold text-ink">{text}</p>
      <p className="mt-1 text-sm text-ink-muted">{subtext}</p>
      {cta && (
        <Link
          to={cta.to}
          className="mt-4 inline-flex items-center rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:shadow-glow transition-all"
        >
          {cta.label}
        </Link>
      )}
    </div>
  )
}

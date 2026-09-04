import { useState, useEffect } from 'react'
import {
  DollarSign,
  ClipboardList,
  Users,
  CalendarCheck,
  GraduationCap,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { apiGetDashboard, apiGetAllOrders, apiGetAnalyticsOverview, getImgUrl } from '../../utils/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatNaira } from '../../utils/format.js'

/* ── Mini bar chart (CSS only) ──────────────────────────── */
function MiniBarChart({ data, maxVal }) {
  const max = maxVal || Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-1" style={{ height: 80 }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-brand-gradient transition-all"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 4 : 0 }}
          />
          <span className="text-[9px] text-ink-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Mini donut chart (SVG) ─────────────────────────────── */
function MiniDonut({ segments, size = 80 }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  let cumulative = 0
  const r = 30
  const circumference = 2 * Math.PI * r

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {segments.map((seg, i) => {
        const pct = seg.value / total
        const dashArray = `${pct * circumference} ${circumference}`
        const offset = -cumulative * circumference
        cumulative += pct
        return (
          <circle
            key={i}
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={dashArray}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
          />
        )
      })}
      <text x="40" y="38" textAnchor="middle" className="fill-ink text-[11px] font-bold">
        {total}
      </text>
      <text x="40" y="49" textAnchor="middle" className="fill-ink-muted text-[7px]">
        total
      </text>
    </svg>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [avatarError, setAvatarError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('all')

  useEffect(() => {
    Promise.all([apiGetDashboard(), apiGetAllOrders(), apiGetAnalyticsOverview(30)])
      .then(([dashboard, allOrders, analyticsData]) => {
        setStats(dashboard)
        setOrders(allOrders)
        setAnalytics(analyticsData)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  // Filter orders by search and date range
  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchQuery ||
      (o.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName || '').toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false
    if (dateRange === 'all') return true
    const orderDate = new Date(o.createdAt)
    const now = new Date()
    if (dateRange === 'today') return orderDate.toDateString() === now.toDateString()
    if (dateRange === '7days') return (now - orderDate) <= 7 * 24 * 60 * 60 * 1000
    if (dateRange === '30days') return (now - orderDate) <= 30 * 24 * 60 * 60 * 1000
    if (dateRange === 'month') return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
    if (dateRange === 'year') return orderDate.getFullYear() === now.getFullYear()
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-pink border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const totalRevenue = stats?.todayRevenue || 0
  const totalOrders = stats?.todayOrders || 0
  const customers = stats?.customerCount || 0
  const eventBookings = stats?.upcomingBookings?.length || 0
  const trainingRegs = stats?.upcomingTrainings?.length || 0
  const pendingOrders = stats?.pendingOrders || 0

  /* ── KPI cards ──────────────────────────────────────────── */
  const kpis = [
    { label: 'Total Revenue', value: formatNaira(totalRevenue), icon: DollarSign, color: 'bg-pink-soft text-pink' },
    { label: 'Orders Today', value: totalOrders, icon: ClipboardList, color: 'bg-lilac-soft text-lilac-deep' },
    { label: 'Total Customers', value: customers, icon: Users, color: 'bg-pink-soft text-pink' },
    { label: 'Event Bookings', value: eventBookings, icon: CalendarCheck, color: 'bg-lilac-soft text-lilac-deep' },
    { label: 'Trainings', value: trainingRegs, icon: GraduationCap, color: 'bg-pink-soft text-pink' },
    { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'bg-warning-soft text-warning' },
  ]

  /* ── Revenue chart data (from analytics or mock) ────────── */
  const revenueData = analytics?.revenueOverTime?.length > 0
    ? analytics.revenueOverTime.slice(-7).map((d) => ({
        label: new Date(d.date).toLocaleDateString('en-NG', { day: 'numeric' }),
        value: Number(d.revenue) || 0,
      }))
    : [
        { label: 'Mon', value: 0 },
        { label: 'Tue', value: 0 },
        { label: 'Wed', value: 0 },
        { label: 'Thu', value: 0 },
        { label: 'Fri', value: 0 },
        { label: 'Sat', value: 0 },
        { label: 'Sun', value: 0 },
      ]

  /* ── Orders chart data ──────────────────────────────────── */
  const ordersByStatus = analytics?.ordersByStatus || []
  const orderStatusColors = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    preparing: '#3B82F6',
    ready: '#22C55E',
    out_for_delivery: '#8B5CF6',
    completed: '#22C55E',
    cancelled: '#EF4444',
  }

  /* ── Best selling products ──────────────────────────────── */
  const bestSellers = analytics?.bestSellingProducts?.slice(0, 5) || []

  /* ── Recent orders ──────────────────────────────────────── */
  const recentOrders = filteredOrders.slice(0, 10)

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Dashboard Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by number or customer..."
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-lilac focus:outline-none focus:ring-1 focus:ring-lilac/20"
          />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-ink focus:border-lilac focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          {/* Admin avatar in header */}
          {user?.avatar_url && !avatarError ? (
            <img
              src={getImgUrl(user.avatar_url)}
              alt={user.full_name}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-lilac-soft"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map(({ label, value, change, up, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                <Icon size={16} />
              </span>
              <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${up ? 'text-green-500' : 'text-red-500'}`}>
                {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {change}
              </span>
            </div>
            <p className="mt-3 text-xl font-bold text-ink">{value}</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue Overview */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Revenue Overview</h3>
            <span className="text-[10px] text-ink-muted">Last 7 days</span>
          </div>
          <div className="mt-4">
            <MiniBarChart data={revenueData} />
          </div>
        </div>

        {/* Orders Overview */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Orders Overview</h3>
            <span className="text-[10px] text-ink-muted">By status</span>
          </div>
          <div className="mt-4 flex items-center gap-6">
            {ordersByStatus.length > 0 ? (
              <MiniDonut
                segments={ordersByStatus.map((s) => ({
                  value: Number(s.count) || 0,
                  color: orderStatusColors[s.status] || '#A39BA9',
                }))}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-lilac-soft">
                <span className="text-[10px] text-ink-muted">No data</span>
              </div>
            )}
            <div className="space-y-1.5">
              {ordersByStatus.length > 0 ? (
                ordersByStatus.map((s) => (
                  <div key={s.status} className="flex items-center gap-2 text-[11px]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: orderStatusColors[s.status] || '#A39BA9' }}
                    />
                    <span className="capitalize text-ink-muted">{s.status?.replace('_', ' ')}</span>
                    <span className="font-semibold text-ink">{s.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-ink-muted">No order data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs lg:col-span-1">
          <h3 className="text-sm font-semibold text-ink">Top Selling Products</h3>
          <div className="mt-4 space-y-3">
            {bestSellers.length > 0 ? (
              bestSellers.map((p, i) => {
                const maxQty = Math.max(...bestSellers.map((b) => Number(b.total_quantity) || 0), 1)
                const pct = ((Number(p.total_quantity) || 0) / maxQty) * 100
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-ink">{p.product_name || p.name}</span>
                      <span className="text-ink-muted">{p.total_quantity || 0} sold</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brand-gradient"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="py-4 text-center text-[11px] text-ink-muted">No sales data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Recent Orders */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Recent Orders {searchQuery || dateRange !== 'all' ? `(${filteredOrders.length} found)` : ''}</h3>
            <a href="/admin/orders" className="text-[11px] font-medium text-pink hover:text-lilac-deep">
              View All
            </a>
          </div>
          <div className="mt-3 space-y-2">
            {recentOrders.length > 0 ? (
              recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-ink">#{o.orderNumber}</p>
                    <p className="text-[10px] text-ink-muted">{o.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-ink">{formatNaira(o.total)}</p>
                    <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] font-semibold text-yellow-700 capitalize">
                      {o.orderStatus?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-[11px] text-ink-muted">No orders yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Upcoming Events</h3>
            <a href="/admin/bookings" className="text-[11px] font-medium text-pink hover:text-lilac-deep">
              View All
            </a>
          </div>
          <div className="mt-3 space-y-2">
            {stats?.upcomingBookings?.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium capitalize text-ink">{b.eventType?.replace('_', ' ')}</p>
                  <p className="text-[10px] text-ink-muted">{b.fullName}</p>
                </div>
                <span className="text-[10px] text-ink-muted">{fd(b.eventDate)}</span>
              </div>
            ))}
            {(!stats?.upcomingBookings || stats.upcomingBookings.length === 0) && (
              <p className="py-4 text-center text-[11px] text-ink-muted">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Training Registrations */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Trainings</h3>
            <a href="/admin/trainings" className="text-[11px] font-medium text-pink hover:text-lilac-deep">
              View All
            </a>
          </div>
          <div className="mt-3 space-y-2">
            {stats?.upcomingTrainings?.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <div>
                  <p className="text-xs font-medium text-ink">{t.title}</p>
                  <p className="text-[10px] text-ink-muted">{fd(t.date)}</p>
                </div>
                <span className="text-[10px] font-semibold text-pink">{t.availableSpaces} spots</span>
              </div>
            ))}
            {(!stats?.upcomingTrainings || stats.upcomingTrainings.length === 0) && (
              <p className="py-4 text-center text-[11px] text-ink-muted">No upcoming trainings</p>
            )}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-ink">Inventory Alerts</h3>
          <div className="mt-3 space-y-2">
            {analytics?.inventoryAlerts?.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                <p className="text-xs font-medium text-ink">{p.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                  p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                </span>
              </div>
            ))}
            {(!analytics?.inventoryAlerts || analytics.inventoryAlerts.length === 0) && (
              <p className="py-4 text-center text-[11px] text-ink-muted">All products in stock</p>
            )}
          </div>
        </div>
      </div>

      {/* Business Summary */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
        <h3 className="mb-4 text-sm font-semibold text-ink">Business Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Avg. Order Value', value: formatNaira(analytics?.overview?.avgOrderValue || 0) },
            { label: 'Repeat Customers', value: analytics?.overview?.repeatCustomers || 0 },
            { label: 'Customer Satisfaction', value: analytics?.overview?.satisfactionRate || 'N/A' },
            { label: 'On-time Delivery', value: analytics?.overview?.onTimeDelivery || 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-lg font-bold text-ink">{value}</p>
              <p className="mt-1 text-[11px] text-ink-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  CalendarCheck,
  GraduationCap,
  DollarSign,
  BarChart3,
  Download,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  apiGetAnalyticsOverview,
  apiGetRevenueAnalytics,
  apiGetProductAnalytics,
  apiGetOrderAnalytics,
  apiGetCustomerAnalytics,
  apiGetBookingAnalytics,
  apiGetTrainingAnalytics,
} from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'
import PieChart from '../../components/ui/PieChart.jsx'

const DATE_RANGES = [
  { label: 'Today', value: 1 },
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: 'This Month', value: 'month' },
  { label: '90 Days', value: 90 },
  { label: 'This Year', value: 'year' },
]

const PIE_COLORS = ['#A97BD6', '#F04B8A', '#6F4AA8', '#FBD7E7', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444']

/* ── CSV Export Helper ──────────────────────────────────── */
function exportToCSV(filename, headers, rows) {
  // Add BOM for proper Excel Unicode support
  const BOM = '\uFEFF'
  const now = new Date()
  const brandHeader = [
    '',
    '═══════════════════════════════════════════════════',
    '  BAMZY CAKES & CONFECTIONERY',
    '  www.bamzycakes.com',
    '═══════════════════════════════════════════════════',
    '',
    'Report: ' + filename.replace('.csv', '').replace(/-/g, ' ').toUpperCase(),
    'Date: ' + now.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }),
    'Time: ' + now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    'Prepared by: Bamzy Admin',
    '',
    '───────────────────────────────────────────────────',
    '',
  ]
  const csvContent = BOM + [
    ...brandHeader,
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    '',
    '───────────────────────────────────────────────────',
    'End of Report',
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function AdminAnalytics() {
  const [days, setDays] = useState(30)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [customRange, setCustomRange] = useState(false)
  const [overview, setOverview] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [products, setProducts] = useState(null)
  const [orders, setOrders] = useState(null)
  const [customers, setCustomers] = useState(null)
  const [bookings, setBookings] = useState(null)
  const [trainings, setTrainings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate actual days for API calls
  const actualDays = customRange && startDate && endDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
    : days === 'month'
    ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    : days === 'year'
    ? 365
    : Number(days)

  // Date range label for exports
  const dateRangeLabel = customRange && startDate && endDate
    ? `${startDate}_to_${endDate}`
    : `${actualDays}days`

  function handleCustomRange() {
    if (startDate && endDate) {
      setCustomRange(true)
    }
  }

  function clearCustomRange() {
    setCustomRange(false)
    setStartDate('')
    setEndDate('')
  }

  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      apiGetAnalyticsOverview(actualDays),
      apiGetRevenueAnalytics(actualDays),
      apiGetProductAnalytics(actualDays),
      apiGetOrderAnalytics(actualDays),
      apiGetCustomerAnalytics(actualDays),
      apiGetBookingAnalytics(),
      apiGetTrainingAnalytics(),
    ])
      .then(([ov, rv, pr, or, cu, bk, tr]) => {
        setOverview(ov)
        setRevenue(rv)
        setProducts(pr)
        setOrders(or)
        setCustomers(cu)
        setBookings(bk)
        setTrainings(tr)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [days])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-pink border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const maxRevenue = revenue.length > 0 ? Math.max(...revenue.map((r) => r.revenue || 0), 1) : 1

  /* ── Pie chart data for categories ──────────────────── */
  const categoryPieData = (products?.categoryPerformance || []).map((c, i) => ({
    label: c.categoryLabel || c.category?.replace('-', ' ') || 'Other',
    value: Number(c.revenue) || 0,
    color: PIE_COLORS[i % PIE_COLORS.length],
    detail: `Revenue from ${c.categoryLabel || c.category || 'this category'} over ${days} days`,
  }))

  /* ── Pie chart data for order status ────────────────── */
  const orderStatusPieData = (orders?.statusBreakdown || []).map((s, i) => ({
    label: s.status.replace('_', ' '),
    value: Number(s.count) || 0,
    color: PIE_COLORS[i % PIE_COLORS.length],
    detail: `${s.count} order(s) with status: ${s.status.replace('_', ' ')}`,
  }))

  /* ── Export handlers ────────────────────────────────── */
  function handleExportRevenue() {
    const headers = ['Date', 'Revenue']
    const rows = revenue.map((r) => [r.date, r.revenue])
    exportToCSV(`bamzy-revenue-${dateRangeLabel}.csv`, headers, rows)
  }

  function handleExportProducts() {
    const headers = ['Product', 'Category', 'Units Sold', 'Revenue']
    const rows = (products?.bestSelling || []).map((p) => [
      p.name,
      p.category?.replace('-', ' ') || '',
      p.unitsSold,
      p.revenue,
    ])
    exportToCSV(`bamzy-products-${dateRangeLabel}.csv`, headers, rows)
  }

  function handleExportOrders() {
    const headers = ['Status', 'Count']
    const rows = (orders?.statusBreakdown || []).map((s) => [
      s.status.replace('_', ' '),
      s.count,
    ])
    exportToCSV(`bamzy-orders-${dateRangeLabel}.csv`, headers, rows)
  }

  function handleExportCustomers() {
    const headers = ['Name', 'Orders', 'Total Spent']
    const rows = (customers?.topCustomers || []).map((c) => [
      c.name,
      c.orderCount,
      c.totalSpent,
    ])
    exportToCSV(`bamzy-customers-${dateRangeLabel}.csv`, headers, rows)
  }

  function handleExportFullReport() {
    const headers = [
      'Metric',
      'Value',
    ]
    const rows = [
      ['Report Period', `${days} days`],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['REVENUE'],
      ['Total Revenue', formatNaira(overview?.totalRevenue || 0)],
      ['Avg Order Value', formatNaira(orders?.avgOrderValue || 0)],
      [''],
      ['ORDERS'],
      ['Total Orders', overview?.totalOrders || 0],
      ['Fulfillment Rate', (orders?.fulfillment?.rate || 0) + '%'],
      ...((orders?.statusBreakdown || []).map((s) => ['  ' + s.status.replace('_', ' '), s.count])),
      [''],
      ['PRODUCTS'],
      ['Total Products', overview?.totalProducts || 0],
      ['Available Today', overview?.availableProducts || 0],
      ...((products?.bestSelling || []).map((p) => ['  ' + p.name, p.unitsSold + ' sold'])),
      [''],
      ['CUSTOMERS'],
      ['Total Customers', overview?.totalCustomers || 0],
      ...((customers?.topCustomers || []).map((c) => ['  ' + c.name, formatNaira(c.totalSpent)])),
      [''],
      ['EVENTS & TRAININGS'],
      ['Event Bookings', bookings?.totalBookings || 0],
      ['Training Registrations', trainings?.totalRegistrations || 0],
      ['Training Revenue', formatNaira(trainings?.totalRevenue || 0)],
      [''],
      ['INVENTORY ALERTS'],
      ...((products?.inventory || []).filter((p) => p.isLowStock || p.isSoldOut).map((p) => [
        '  ' + p.name,
        p.isSoldOut ? 'SOLD OUT' : p.stock + ' left',
      ])),
    ]
    exportToCSV('bamzy-full-report.csv', headers, rows)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="admin-section-title">Analytics</h1>
          <p className="mt-1 text-sm text-ink-muted">Track your sales, orders, and customer activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-full border border-lilac-soft bg-white p-1">
            {DATE_RANGES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDays(value)}
                className={
                  'rounded-full px-4 py-1.5 text-xs font-semibold transition-all ' +
                  (days === value ? 'bg-brand-gradient text-white shadow-xs' : 'text-ink-muted hover:text-ink')
                }
              >
                {label}
              </button>
            ))}
          </div>
          {/* Custom Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCustomRange(false) }}
              className="rounded-lg border border-lilac-soft bg-white px-3 py-2 text-xs text-ink focus:border-lilac focus:outline-none"
              placeholder="Start date"
            />
            <span className="text-xs text-ink-muted">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCustomRange(false) }}
              className="rounded-lg border border-lilac-soft bg-white px-3 py-2 text-xs text-ink focus:border-lilac focus:outline-none"
              placeholder="End date"
            />
            {startDate && endDate && (
              <button
                onClick={handleCustomRange}
                className="rounded-lg bg-lilac-soft px-3 py-2 text-xs font-semibold text-lilac-deep hover:bg-lilac/20 transition-colors"
              >
                Apply
              </button>
            )}
            {customRange && (
              <button
                onClick={clearCustomRange}
                className="rounded-lg bg-pink-soft px-3 py-2 text-xs font-semibold text-pink hover:bg-pink/10 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <button
            onClick={handleExportFullReport}
            className="flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-card transition-all hover:shadow-glow"
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>
      {/* Active Date Range Indicator */}
      {customRange && startDate && endDate && (
        <div className="rounded-xl border border-lilac bg-lilac-soft/50 px-4 py-2 text-sm text-ink">
          📅 Showing data from <strong>{new Date(startDate).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })}</strong> to <strong>{new Date(endDate).toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: formatNaira(overview?.totalRevenue || 0), icon: DollarSign, color: 'text-pink' },
          { label: 'Total Orders', value: overview?.totalOrders || 0, icon: ShoppingCart, color: 'text-lilac-deep' },
          { label: 'Customers', value: overview?.totalCustomers || 0, icon: Users, color: 'text-pink' },
          { label: 'Avg Order Value', value: formatNaira(orders?.avgOrderValue || 0), icon: TrendingUp, color: 'text-lilac-deep' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted">{label}</span>
              <span className={'flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient-soft ' + color}>
                <Icon size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold">Revenue Over Time</h3>
          <button onClick={handleExportRevenue} className="flex items-center gap-1 text-xs font-medium text-pink hover:text-lilac-deep">
            <Download size={12} /> Export CSV
          </button>
        </div>
        <div className="mt-4 h-48">
          {revenue.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-muted">No revenue data for this period.</p>
          ) : (
            <div className="flex h-full items-end gap-1">
              {revenue.map((r, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-ink-muted">{formatCompact(r.revenue)}</span>
                  <div
                    className="w-full rounded-t bg-brand-gradient transition-all"
                    style={{ height: `${(r.revenue / maxRevenue) * 100}%`, minHeight: 4 }}
                  />
                  <span className="text-[9px] text-ink-muted">
                    {new Date(r.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pie Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Pie Chart */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-lilac-deep" />
              <h3 className="font-heading text-lg font-semibold">Sales by Category</h3>
            </div>
            <button onClick={handleExportProducts} className="flex items-center gap-1 text-xs font-medium text-pink hover:text-lilac-deep">
              <Download size={12} /> Export
            </button>
          </div>
          <div className="mt-4">
            {categoryPieData.length > 0 ? (
              <PieChart segments={categoryPieData} formatValue={(v) => formatNaira(v)} />
            ) : (
              <p className="py-8 text-center text-sm text-ink-muted">No category data yet.</p>
            )}
          </div>
        </div>

        {/* Order Status Pie Chart */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-pink" />
              <h3 className="font-heading text-lg font-semibold">Order Status</h3>
            </div>
            <button onClick={handleExportOrders} className="flex items-center gap-1 text-xs font-medium text-pink hover:text-lilac-deep">
              <Download size={12} /> Export
            </button>
          </div>
          <div className="mt-4">
            {orderStatusPieData.length > 0 ? (
              <>
                <PieChart segments={orderStatusPieData} formatValue={(v) => String(v)} />
                {orders?.fulfillment && (
                  <div className="mt-4 rounded-lg bg-brand-gradient-soft p-3 text-center">
                    <p className="text-xs text-ink-muted">Fulfillment Rate</p>
                    <p className="text-2xl font-bold text-pink">{orders.fulfillment.rate}%</p>
                  </div>
                )}
              </>
            ) : (
              <p className="py-8 text-center text-sm text-ink-muted">No order data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Best Selling + Customers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Best Selling Products */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-pink" />
              <h3 className="font-heading text-lg font-semibold">Best Selling Products</h3>
            </div>
            <button onClick={handleExportProducts} className="flex items-center gap-1 text-xs font-medium text-pink hover:text-lilac-deep">
              <Download size={12} /> Export
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {products?.bestSelling?.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">No sales data yet.</p>
            ) : (
              products?.bestSelling?.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-lilac-soft/30 px-3 py-2.5 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="text-xs text-ink-muted capitalize">{p.category?.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-pink">{p.unitsSold} sold</p>
                    <p className="text-xs text-ink-muted">{formatNaira(p.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-lilac-deep" />
              <h3 className="font-heading text-lg font-semibold">Top Customers</h3>
            </div>
            <button onClick={handleExportCustomers} className="flex items-center gap-1 text-xs font-medium text-pink hover:text-lilac-deep">
              <Download size={12} /> Export
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {customers?.topCustomers?.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">No customers yet.</p>
            ) : (
              customers?.topCustomers?.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-lilac-soft/30 px-3 py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient-soft text-xs font-bold text-pink">
                      {c.name?.charAt(0) || '?'}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{c.name}</p>
                      <p className="text-xs text-ink-muted">{c.orderCount} order(s)</p>
                    </div>
                  </div>
                  <span className="font-semibold text-pink">{formatNaira(c.totalSpent)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bookings & Trainings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} className="text-pink" />
            <h3 className="font-heading text-lg font-semibold">Event Bookings</h3>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-ink">{bookings?.totalBookings || 0}</p>
            <p className="text-xs text-ink-muted">total bookings</p>
            {bookings?.eventTypes?.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {bookings.eventTypes.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-ink-muted">{e.type.replace('_', ' ')}</span>
                    <span className="font-medium text-ink">{e.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-lilac-deep" />
            <h3 className="font-heading text-lg font-semibold">Training</h3>
          </div>
          <div className="mt-4">
            <div className="flex gap-4 text-sm">
              <div>
                <p className="text-2xl font-bold text-ink">{trainings?.totalRegistrations || 0}</p>
                <p className="text-xs text-ink-muted">registrations</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink">{formatNaira(trainings?.totalRevenue || 0)}</p>
                <p className="text-xs text-ink-muted">revenue</p>
              </div>
            </div>
            {trainings?.popularTraining && (
              <div className="mt-3 rounded-lg bg-lilac-soft/50 p-3">
                <p className="text-xs text-ink-muted">Most Popular</p>
                <p className="text-sm font-semibold text-ink">{trainings.popularTraining.title}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      {products?.inventory && (
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-pink" />
            <h3 className="font-heading text-lg font-semibold">Inventory Alert</h3>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {products.inventory
              .filter((p) => p.isLowStock || p.isSoldOut)
              .map((p, i) => (
                <div
                  key={i}
                  className={
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm ' +
                    (p.isSoldOut ? 'bg-error-soft' : 'bg-warning-soft')
                  }
                >
                  <span className="font-medium text-ink">{p.name}</span>
                  <span
                    className={
                      'text-xs font-semibold ' + (p.isSoldOut ? 'text-error' : 'text-warning')
                    }
                  >
                    {p.isSoldOut ? 'Sold Out' : p.stock + ' left'}
                  </span>
                </div>
              ))}
            {products.inventory.filter((p) => p.isLowStock || p.isSoldOut).length === 0 && (
              <p className="col-span-full py-4 text-center text-sm text-ink-muted">
                All products are well stocked.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function formatCompact(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

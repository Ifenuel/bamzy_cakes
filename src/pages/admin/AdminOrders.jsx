import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Search, ChevronDown, Package, Truck, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { apiGetAllOrders, apiUpdateOrderStatus, getImgUrl } from '../../utils/api.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { formatNaira } from '../../utils/format.js'

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled']
const STATUS_CONFIG = {
  pending:         { label: 'Pending',        color: 'bg-amber-50 text-amber-700 border-amber-200',        dot: 'bg-amber-400' },
  confirmed:       { label: 'Confirmed',      color: 'bg-blue-50 text-blue-700 border-blue-200',          dot: 'bg-blue-400' },
  preparing:       { label: 'Preparing',      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',    dot: 'bg-indigo-400' },
  ready:           { label: 'Ready',          color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  out_for_delivery:{ label: 'Out for Delivery', color: 'bg-purple-50 text-purple-700 border-purple-200',  dot: 'bg-purple-400' },
  completed:       { label: 'Completed',      color: 'bg-green-50 text-green-700 border-green-200',       dot: 'bg-green-400' },
  cancelled:       { label: 'Cancelled',      color: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-400' },
}

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function AdminOrders() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    let cancelled = false
    apiGetAllOrders()
      .then((data) => { if (!cancelled) { setOrders(data || []); setIsLoading(false) } })
      .catch((err) => {
        console.error('Failed to load orders:', err)
        if (!cancelled) setIsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  async function handleStatus(orderId, status) {
    try {
      await apiUpdateOrderStatus(orderId, status)
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, orderStatus: status } : o))
      showToast('Order status updated.', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error')
    }
  }

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    active: orders.filter(o => ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.orderStatus)).length,
    completed: orders.filter(o => o.orderStatus === 'completed').length,
    revenue: orders.filter(o => o.orderStatus === 'completed').reduce((s, o) => s + (parseFloat(o.total) || 0), 0),
  }), [orders])

  const filtered = useMemo(() => {
    let result = orders
    if (statusTab !== 'all') result = result.filter(o => o.orderStatus === statusTab)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerEmail || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [orders, statusTab, search])

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
  const ft = (d) => new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-pink border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-ink-muted">Manage customer orders and track deliveries</p>
        </div>
        <button onClick={() => setIsLoading(true) || apiGetAllOrders().then(d => { setOrders(d || []); setIsLoading(false) })}
          className="flex items-center gap-2 rounded-full border border-lilac-soft bg-white px-4 py-2 text-xs font-medium text-ink-muted hover:border-lilac hover:text-lilac-deep transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {[
          { label: 'Total Orders', value: stats.total, icon: ClipboardList, gradient: 'from-lilac/20 to-pink/10', iconColor: 'text-lilac-deep' },
          { label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-50 to-orange-50', iconColor: 'text-amber-500' },
          { label: 'Active', value: stats.active, icon: Package, gradient: 'from-blue-50 to-indigo-50', iconColor: 'text-blue-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, gradient: 'from-green-50 to-emerald-50', iconColor: 'text-green-500' },
          { label: 'Revenue', value: formatNaira(stats.revenue), icon: Truck, gradient: 'from-pink-50 to-rose-50', iconColor: 'text-pink', isRevenue: true },
        ].map(({ label, value, icon: Icon, gradient, iconColor, isRevenue }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl bg-gradient-to-br ${gradient} border border-lilac-soft/50 p-4`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 ${iconColor}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className={`font-bold ${isRevenue ? 'text-lg text-pink' : 'text-2xl text-ink'}`}>{value}</p>
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
            placeholder="Search by order number, customer name, or email..."
            className="w-full rounded-xl border border-lilac-soft bg-white py-2.5 pl-9 pr-4 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20 transition-all" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(({ key, label }) => {
            const count = key === 'all' ? orders.length : orders.filter(o => o.orderStatus === key).length
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

      {/* Orders List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((o, i) => {
            const sc = STATUS_CONFIG[o.orderStatus] || STATUS_CONFIG.pending
            const isExpanded = expandedOrder === o.id
            return (
              <motion.div key={o.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-lilac-soft bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                {/* Main Row */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${sc.dot} shrink-0`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-ink">#{o.orderNumber}</p>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${sc.color}`}>
                            {sc.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-ink-muted">{o.customerName} &middot; {o.customerEmail}</p>
                        <p className="text-xs text-ink-muted">{fd(o.createdAt)} at {ft(o.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-base font-bold text-pink">{formatNaira(o.total)}</p>
                        <p className="text-[10px] capitalize text-ink-muted">{o.deliveryMethod}</p>
                      </div>
                      <button onClick={() => setExpandedOrder(isExpanded ? null : o.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-lilac-soft/50 text-ink-muted hover:bg-lilac-soft transition-colors">
                        <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Items preview */}
                  {o.items && o.items.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {o.items.slice(0, 5).map((item, j) => (
                        <div key={j} className="flex items-center gap-1.5 rounded-full bg-lilac-soft/40 px-2.5 py-1">
                          {item.imageUrl ? (
                            <img src={getImgUrl(item.imageUrl)} alt={item.name} className="h-5 w-5 rounded-full object-cover" />
                          ) : null}
                          <span className="text-[11px] text-ink-muted">{item.name} &times;{item.quantity}</span>
                        </div>
                      ))}
                      {o.items.length > 5 && (
                        <span className="flex items-center rounded-full bg-lilac-soft/40 px-2.5 py-1 text-[11px] text-ink-muted">
                          +{o.items.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-lilac-soft bg-lilac-soft/10 p-4 sm:p-5 space-y-4">
                        {/* Order Timeline */}
                        {o.items && o.items.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-ink mb-2">Order Items</p>
                            <div className="space-y-2">
                              {o.items.map((item, j) => (
                                <div key={j} className="flex items-center gap-3 rounded-lg bg-white p-2.5 border border-lilac-soft/50">
                                  {item.imageUrl ? (
                                    <img src={getImgUrl(item.imageUrl)} alt={item.name} className="h-10 w-10 rounded-lg object-cover" />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lilac-soft text-xs">📦</div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                                    <p className="text-xs text-ink-muted">Qty: {item.quantity} &middot; {formatNaira(item.price)}</p>
                                  </div>
                                  <p className="text-sm font-semibold text-pink">{formatNaira(item.price * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Address & Delivery */}
                        {o.deliveryAddress && (
                          <div className="rounded-lg bg-white p-3 border border-lilac-soft/50">
                            <p className="text-xs font-semibold text-ink mb-1">Delivery Address</p>
                            <p className="text-xs text-ink-muted">{o.deliveryAddress}</p>
                          </div>
                        )}

                        {/* Status Update */}
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-semibold text-ink">Update Status:</p>
                          <select value={o.orderStatus} onChange={(e) => handleStatus(o.id, e.target.value)}
                            className="rounded-lg border border-lilac-soft bg-white px-3 py-2 text-xs font-medium text-ink focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20">
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
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
            <ClipboardList size={48} className="mx-auto text-lilac-soft" />
            <p className="mt-3 text-sm font-medium text-ink-muted">
              {search ? 'No orders match your search.' : statusTab !== 'all' ? `No ${statusTab} orders.` : 'No orders yet.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

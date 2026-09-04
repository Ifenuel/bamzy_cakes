import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Mail, Phone, ShoppingBag, TrendingUp, UserCheck, RefreshCw } from 'lucide-react'
import { apiGetCustomers } from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    apiGetCustomers().then((data) => { setCustomers(data || []); setIsLoading(false) }).catch(() => setIsLoading(false))
  }, [])

  const stats = useMemo(() => ({
    total: customers.length,
    totalSpent: customers.reduce((s, c) => s + (parseFloat(c.totalSpent) || 0), 0),
    avgSpent: customers.length > 0 ? customers.reduce((s, c) => s + (parseFloat(c.totalSpent) || 0), 0) / customers.length : 0,
    withOrders: customers.filter(c => (c.orderCount || 0) > 0).length,
  }), [customers])

  const filtered = useMemo(() => {
    let result = [...customers]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        (c.fullName || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q)
      )
    }
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    else if (sortBy === 'most_orders') result.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
    else if (sortBy === 'highest_spent') result.sort((a, b) => (parseFloat(b.totalSpent) || 0) - (parseFloat(a.totalSpent) || 0))
    return result
  }, [customers, search, sortBy])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-pink border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Customers</h1>
          <p className="mt-1 text-sm text-ink-muted">View and manage all registered customers</p>
        </div>
        <button onClick={() => { setIsLoading(true); apiGetCustomers().then(d => { setCustomers(d || []); setIsLoading(false) }) }}
          className="flex items-center gap-2 rounded-full border border-lilac-soft bg-white px-4 py-2 text-xs font-medium text-ink-muted hover:border-lilac hover:text-lilac-deep transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Customers', value: stats.total, icon: Users, gradient: 'from-lilac/20 to-pink/10', iconColor: 'text-lilac-deep' },
          { label: 'Active Buyers', value: stats.withOrders, icon: UserCheck, gradient: 'from-green-50 to-emerald-50', iconColor: 'text-green-500' },
          { label: 'Total Revenue', value: formatNaira(stats.totalSpent), icon: TrendingUp, gradient: 'from-pink-50 to-rose-50', iconColor: 'text-pink', isLarge: true },
          { label: 'Avg. Spent', value: formatNaira(stats.avgSpent), icon: ShoppingBag, gradient: 'from-amber-50 to-orange-50', iconColor: 'text-amber-500', isLarge: true },
        ].map(({ label, value, icon: Icon, gradient, iconColor, isLarge }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl bg-gradient-to-br ${gradient} border border-lilac-soft/50 p-4`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 ${iconColor}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className={`font-bold ${isLarge ? 'text-lg text-pink' : 'text-2xl text-ink'}`}>{value}</p>
                <p className="text-[11px] font-medium text-ink-muted">{label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full rounded-xl border border-lilac-soft bg-white py-2.5 pl-9 pr-4 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20 transition-all" />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-lilac-soft bg-white px-3 py-2.5 text-xs font-medium text-ink focus:border-lilac focus:outline-none">
          <option value="newest">Newest First</option>
          <option value="most_orders">Most Orders</option>
          <option value="highest_spent">Highest Spent</option>
        </select>
      </div>

      {/* Customer Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-lilac-soft bg-white p-4 shadow-sm hover:shadow-md transition-all sm:p-5">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink to-lilac text-base font-bold text-white shadow-sm">
                  {(c.fullName || '?').charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-sm font-semibold text-ink">{c.fullName}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1 text-xs text-ink-muted">
                      <Mail size={11} /> {c.email}
                    </span>
                    {c.phone && (
                      <span className="flex items-center gap-1 text-xs text-ink-muted">
                        <Phone size={11} /> {c.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-ink-muted">{c.orderCount || 0} order(s)</p>
                  <p className="text-sm font-bold text-pink">{formatNaira(c.totalSpent || 0)}</p>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="mt-3 flex items-center justify-between border-t border-lilac-soft/50 pt-3 sm:hidden">
                <span className="text-xs text-ink-muted">{c.orderCount || 0} order(s)</span>
                <span className="text-sm font-bold text-pink">{formatNaira(c.totalSpent || 0)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <Users size={48} className="mx-auto text-lilac-soft" />
            <p className="mt-3 text-sm font-medium text-ink-muted">
              {search ? 'No customers match your search.' : 'No customers yet.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

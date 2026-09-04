import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Search, MessageCircle, Phone, Mail, RefreshCw, Trash2 } from 'lucide-react'
import { apiGetAdminWishlists, getImgUrl } from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'

export default function AdminWishlists() {
  const [wishlists, setWishlists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadWishlists()
  }, [])

  async function loadWishlists() {
    try {
      const data = await apiGetAdminWishlists()
      setWishlists(data || [])
    } catch (err) {
      console.error('Failed to load wishlists:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = useMemo(() => ({
    total: wishlists.length,
    customers: new Set(wishlists.map(w => w.customerId)).size,
    products: new Set(wishlists.map(w => w.productId)).size,
    totalValue: wishlists.reduce((s, w) => s + (parseFloat(w.productPrice) || 0), 0),
  }), [wishlists])

  const filtered = useMemo(() => {
    if (!search) return wishlists
    const q = search.toLowerCase()
    return wishlists.filter(w =>
      (w.customerName || '').toLowerCase().includes(q) ||
      (w.customerEmail || '').toLowerCase().includes(q) ||
      (w.productName || '').toLowerCase().includes(q)
    )
  }, [wishlists, search])

  // Group by customer
  const groupedByCustomer = useMemo(() => {
    const groups = {}
    filtered.forEach(w => {
      if (!groups[w.customerId]) {
        groups[w.customerId] = {
          customer: { id: w.customerId, name: w.customerName, email: w.customerEmail, phone: w.customerPhone },
          items: [],
        }
      }
      groups[w.customerId].items.push(w)
    })
    return Object.values(groups)
  }, [filtered])

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })

  function getWhatsAppLink(phone, customerName, productName) {
    if (!phone) return null
    const clean = phone.replace(/[^0-9+]/g, '')
    const msg = encodeURIComponent(`Hi ${customerName},\n\nI noticed you saved "${productName}" in your wishlist on Bamzy Cakes. We'd love to help you with this order!\n\nLet's discuss the details and pricing.\n\nBest regards,\nBamzy Cakes & Confectionery`)
    return `https://wa.me/${clean.startsWith('+') ? clean.slice(1) : '234' + clean.replace(/^0/, '')}?text=${msg}`
  }

  function getEmailLink(email, customerName, productName) {
    const subject = encodeURIComponent(`Your Bamzy Cakes Wishlist - ${productName}`)
    const body = encodeURIComponent(`Hi ${customerName},\n\nI noticed you saved "${productName}" in your wishlist on Bamzy Cakes.\n\nWe'd love to help you with this order! Please let us know the quantity and any customizations you'd like.\n\nBest regards,\nBamzy Cakes & Confectionery\nwww.bamzycakes.com`)
    return `mailto:${email}?subject=${subject}&body=${body}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-pink border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">Loading wishlists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink sm:text-3xl">Customer Wishlists</h1>
          <p className="mt-1 text-sm text-ink-muted">View what customers have saved and reach out to help them order</p>
        </div>
        <button onClick={() => { setIsLoading(true); loadWishlists() }}
          className="flex items-center gap-2 rounded-full border border-lilac-soft bg-white px-4 py-2 text-xs font-medium text-ink-muted hover:border-lilac hover:text-lilac-deep transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Wishlists', value: stats.total, gradient: 'from-lilac/20 to-pink/10' },
          { label: 'Customers', value: stats.customers, gradient: 'from-blue-50 to-indigo-50' },
          { label: 'Products Saved', value: stats.products, gradient: 'from-green-50 to-emerald-50' },
          { label: 'Total Value', value: formatNaira(stats.totalValue), gradient: 'from-pink-50 to-rose-50', isLarge: true },
        ].map(({ label, value, gradient, isLarge }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl bg-gradient-to-br ${gradient} border border-lilac-soft/50 p-4`}>
            <p className={`font-bold ${isLarge ? 'text-lg text-pink' : 'text-2xl text-ink'}`}>{value}</p>
            <p className="text-[11px] font-medium text-ink-muted">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, email, or product..."
          className="w-full rounded-xl border border-lilac-soft bg-white py-2.5 pl-9 pr-4 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20 transition-all" />
      </div>

      {/* Customer Groups */}
      <div className="space-y-6">
        <AnimatePresence>
          {groupedByCustomer.map((group, gi) => {
            const whatsappLink = getWhatsAppLink(group.customer.phone, group.customer.name, group.items[0]?.productName)
            const emailLink = getEmailLink(group.customer.email, group.customer.name, group.items[0]?.productName)
            return (
              <motion.div key={group.customer.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05 }}
                className="rounded-xl border border-lilac-soft bg-white shadow-sm overflow-hidden">
                {/* Customer Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-lilac-soft bg-gradient-to-r from-lilac/10 to-pink/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink to-lilac text-sm font-bold text-white">
                      {(group.customer.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold text-ink">{group.customer.name}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                        <span className="flex items-center gap-1"><Mail size={11} /> {group.customer.email}</span>
                        {group.customer.phone && (
                          <span className="flex items-center gap-1"><Phone size={11} /> {group.customer.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-lilac-soft px-3 py-1 text-xs font-semibold text-lilac-deep">
                      {group.items.length} item(s)
                    </span>
                    {/* Contact buttons */}
                    {whatsappLink && (
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition-colors">
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    )}
                    <a href={emailLink}
                      className="flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors">
                      <Mail size={13} /> Email
                    </a>
                  </div>
                </div>

                {/* Wishlist Items */}
                <div className="divide-y divide-lilac-soft/50">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-lilac-soft/20 transition-colors">
                      {item.productImage ? (
                        <img src={getImgUrl(item.productImage)} alt={item.productName}
                          className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-soft to-lilac-soft text-2xl">
                          🧁
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink truncate">{item.productName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-pink">{formatNaira(item.productPrice)}</span>
                          <span className="text-xs capitalize text-ink-muted">&middot; {item.productCategory}</span>
                        </div>
                        <p className="text-[10px] text-ink-light mt-0.5">Saved {fd(item.createdAt)}</p>
                      </div>
                      {/* Quick action — message about this specific product */}
                      {group.customer.phone && (
                        <a href={getWhatsAppLink(group.customer.phone, group.customer.name, item.productName)}
                          target="_blank" rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1 rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors">
                          <MessageCircle size={12} /> Enquire
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {groupedByCustomer.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <Heart size={48} className="mx-auto text-lilac-soft" />
            <p className="mt-3 text-sm font-medium text-ink-muted">
              {search ? 'No wishlists match your search.' : 'No customer wishlists yet.'}
            </p>
            <p className="mt-1 text-xs text-ink-muted">When customers save products, they'll appear here.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

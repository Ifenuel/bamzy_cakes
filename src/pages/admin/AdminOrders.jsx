import { useState, useEffect } from 'react'
import { apiGetAllOrders, apiUpdateOrderStatus, getImgUrl } from '../../utils/api.js'
import { useToast } from '../../components/ui/Toast.jsx'
import { formatNaira } from '../../utils/format.js'

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled']
const SC = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', preparing: 'bg-blue-100 text-blue-700', ready: 'bg-green-100 text-green-700', out_for_delivery: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' }

export default function AdminOrders() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })

  if (isLoading) return <div className="py-20 text-center text-ink-muted">Loading orders...</div>

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink">Orders</h1>
      <p className="mt-1 text-sm text-ink-muted">{orders.length} total orders</p>
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl2 border border-lilac-soft bg-white p-4 shadow-soft sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink">#{o.orderNumber}</p>
                <p className="text-xs text-ink-muted">{o.customerName} &middot; {o.customerEmail}</p>
                <p className="text-xs text-ink-muted">{fd(o.createdAt)}</p>
                {o.items && o.items.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {o.items.slice(0, 4).map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 rounded-full bg-lilac-soft/40 px-2 py-0.5">
                        {item.imageUrl ? (
                          <img src={getImgUrl(item.imageUrl)} alt={item.name} className="h-5 w-5 rounded-full object-cover" />
                        ) : null}
                        <span className="text-[10px] text-ink-muted">{item.name} x{item.quantity}</span>
                      </div>
                    ))}
                    {o.items.length > 4 && <span className="text-[10px] text-ink-muted">+{o.items.length - 4} more</span>}
                  </div>
                )}
              </div>
              <span className={'rounded-full px-3 py-1 text-xs font-semibold capitalize ' + (SC[o.orderStatus] || 'bg-ink/5 text-ink-muted')}>{o.orderStatus?.replace('_', ' ')}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-lilac-soft pt-3">
              <div>
                <span className="text-sm font-bold text-pink">{formatNaira(o.total)}</span>
                <span className="ml-2 text-xs text-ink-muted capitalize">{o.deliveryMethod}</span>
              </div>
              <select value={o.orderStatus} onChange={(e) => handleStatus(o.id, e.target.value)}
                className="rounded-full border border-lilac-soft bg-white px-3 py-1.5 text-xs font-medium text-ink focus:border-lilac focus:outline-none">
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No orders yet.</p>}
      </div>
    </div>
  )
}

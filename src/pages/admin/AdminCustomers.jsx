import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { apiGetCustomers } from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiGetCustomers().then((data) => { setCustomers(data); setIsLoading(false) }).catch(() => setIsLoading(false))
  }, [])

  if (isLoading) return <div className="py-20 text-center text-ink-muted">Loading customers...</div>

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient-soft text-pink"><Users size={20} /></span>
        <div><h1 className="font-heading text-2xl font-bold text-ink">Customers</h1><p className="text-sm text-ink-muted">{customers.length} customers</p></div>
      </div>
      <div className="mt-4 space-y-3">
        {customers.map((c) => (
          <div key={c.id} className="flex items-center gap-4 rounded-xl2 border border-lilac-soft bg-white p-4 shadow-soft">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-gradient-soft font-heading text-sm font-bold text-pink">
              {(c.fullName || '?').charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{c.fullName}</p>
              <p className="text-xs text-ink-muted">{c.email} {c.phone ? '| ' + c.phone : ''}</p>
            </div>
            <div className="hidden text-right text-sm text-ink-muted sm:block">
              <p>{c.orderCount} order(s)</p>
              <p className="font-semibold text-pink">{formatNaira(c.totalSpent)}</p>
            </div>
          </div>
        ))}
        {customers.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No customers yet.</p>}
      </div>
    </div>
  )
}

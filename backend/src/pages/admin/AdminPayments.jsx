import { useState, useEffect } from 'react'
import { CreditCard } from 'lucide-react'
import { apiGetPayments } from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'

const SC = { successful: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', failed: 'bg-red-100 text-red-700' }

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiGetPayments().then((data) => { setPayments(data); setIsLoading(false) }).catch(() => setIsLoading(false))
  }, [])

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })

  if (isLoading) return <div className="py-20 text-center text-ink-muted">Loading payments...</div>

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient-soft text-pink"><CreditCard size={20} /></span>
        <div><h1 className="font-heading text-2xl font-bold text-ink">Payments</h1><p className="text-sm text-ink-muted">{payments.length} payment records</p></div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-lilac-soft text-ink-muted">
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr></thead>
          <tbody>{payments.map((p) => (
            <tr key={p.id} className="border-b border-lilac-soft/50">
              <td className="px-4 py-3 font-mono text-xs text-ink">{p.reference}</td>
              <td className="px-4 py-3 text-ink">{p.customerName || '—'}</td>
              <td className="px-4 py-3 text-ink-muted text-xs">{p.orderNumber || '—'}</td>
              <td className="px-4 py-3 font-semibold text-pink">{formatNaira(p.amount)}</td>
              <td className="px-4 py-3"><span className={'rounded-full px-2 py-0.5 text-xs font-semibold capitalize ' + (SC[p.status] || 'bg-ink/5 text-ink-muted')}>{p.status}</span></td>
              <td className="px-4 py-3 text-ink-muted">{fd(p.createdAt)}</td>
            </tr>
          ))}</tbody>
        </table>
        {payments.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No payments yet.</p>}
      </div>
    </div>
  )
}

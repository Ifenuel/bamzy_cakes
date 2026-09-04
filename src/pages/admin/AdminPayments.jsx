import { useState, useEffect } from 'react'
import { CreditCard, Download, Search } from 'lucide-react'
import { apiGetPayments } from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'

const SC = { successful: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', failed: 'bg-red-100 text-red-700' }

function exportPaymentsCSV(payments) {
  const BOM = '\uFEFF'
  const now = new Date()
  const brandHeader = [
    '',
    '═══════════════════════════════════════════════════',
    '  BAMZY CAKES & CONFECTIONERY',
    '  www.bamzycakes.com',
    '═══════════════════════════════════════════════════',
    '',
    'Report: PAYMENT RECORDS',
    'Date: ' + now.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }),
    'Time: ' + now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    'Prepared by: Bamzy Admin',
    '',
    '───────────────────────────────────────────────────',
    '',
  ]
  const headers = ['Reference', 'Customer', 'Order Number', 'Amount', 'Status', 'Method', 'Date']
  const rows = payments.map(p => [
    p.reference || '',
    p.customerName || '',
    p.orderNumber || '',
    p.amount || 0,
    p.status || '',
    p.method || '',
    p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
  ])
  const totalAmount = payments.filter(p => p.status === 'successful').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)

  const csvContent = BOM + [
    ...brandHeader,
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    '',
    '───────────────────────────────────────────────────',
    `Total Successful: ${formatNaira(totalAmount)}`,
    `Total Records: ${payments.length}`,
    'End of Report',
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'bamzy-payments-' + now.toISOString().slice(0, 10) + '.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiGetPayments().then((data) => { setPayments(data); setIsLoading(false) }).catch(() => setIsLoading(false))
  }, [])

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })

  const filtered = payments.filter(p =>
    (p.reference || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.orderNumber || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalSuccessful = payments.filter(p => p.status === 'successful').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-pink border-t-transparent" />
          <p className="mt-3 text-sm text-ink-muted">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="admin-section-title">Payments</h1>
          <p className="mt-1 text-sm text-ink-muted">{payments.length} payment records</p>
        </div>
        <button
          onClick={() => exportPaymentsCSV(filtered)}
          className="flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-card transition-all hover:shadow-glow"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-lilac-soft bg-white p-4 shadow-xs">
          <p className="text-xs text-ink-muted">Total Payments</p>
          <p className="mt-1 text-2xl font-bold text-ink">{payments.length}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50 p-4 shadow-xs">
          <p className="text-xs text-green-600">Successful</p>
          <p className="mt-1 text-2xl font-bold text-green-700">{formatNaira(totalSuccessful)}</p>
        </div>
        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4 shadow-xs">
          <p className="text-xs text-yellow-600">Pending</p>
          <p className="mt-1 text-2xl font-bold text-yellow-700">{formatNaira(totalPending)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reference, customer, or order..."
          className="w-full rounded-xl border border-lilac-soft bg-white py-2.5 pl-9 pr-4 text-sm focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-lilac-soft bg-white shadow-xs">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-lilac-soft bg-lilac-soft/30">
              <th className="px-4 py-3 font-medium text-ink-muted">Reference</th>
              <th className="px-4 py-3 font-medium text-ink-muted">Customer</th>
              <th className="px-4 py-3 font-medium text-ink-muted">Order</th>
              <th className="px-4 py-3 font-medium text-ink-muted">Amount</th>
              <th className="px-4 py-3 font-medium text-ink-muted">Status</th>
              <th className="px-4 py-3 font-medium text-ink-muted">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-lilac-soft/50 hover:bg-lilac-soft/20 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-ink">{p.reference}</td>
                <td className="px-4 py-3 text-ink">{p.customerName || '—'}</td>
                <td className="px-4 py-3 text-ink-muted text-xs">{p.orderNumber || '—'}</td>
                <td className="px-4 py-3 font-semibold text-pink">{formatNaira(p.amount)}</td>
                <td className="px-4 py-3">
                  <span className={'rounded-full px-2.5 py-1 text-xs font-semibold capitalize ' + (SC[p.status] || 'bg-ink/5 text-ink-muted')}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-muted">{fd(p.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No payments found.</p>}
      </div>
    </div>
  )
}

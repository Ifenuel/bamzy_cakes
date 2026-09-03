import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, ShoppingBag, User, Clock, CreditCard, MapPin, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Button from '../../components/ui/Button.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import { getOrderById } from '../../services/orderService.js'
import { formatNaira } from '../../utils/format.js'
import { getImgUrl } from '../../utils/api.js'

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Clock },
  { key: 'ready', label: 'Ready', icon: CheckCircle },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
]

const STEP_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed']

const STATUS_STYLES = {
  pending: 'bg-warning-soft text-warning',
  confirmed: 'bg-success-soft text-success',
  preparing: 'bg-info-soft text-info',
  ready: 'bg-success-soft text-success',
  out_for_delivery: 'bg-info-soft text-info',
  completed: 'bg-success-soft text-success',
  cancelled: 'bg-error-soft text-error',
}

const PAYMENT_STYLES = {
  pending: 'bg-warning-soft text-warning',
  successful: 'bg-success-soft text-success',
  failed: 'bg-error-soft text-error',
  refunded: 'bg-info-soft text-info',
}

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ok = true
    const guestEmail = localStorage.getItem('bamzy_checkout_email')
    getOrderById(orderId, guestEmail)
      .then((d) => { if (ok) { setOrder(d); setIsLoading(false) } })
      .catch(() => { if (ok) setIsLoading(false) })
    return () => { ok = false }
  }, [orderId])

  if (isLoading) return <LoadingSpinner label="Loading order..." />

  if (!order) {
    return (
      <Section>
        <PageContainer>
          <div className="py-20 text-center">
            <p className="text-5xl">📦</p>
            <h1 className="mt-4 font-heading text-2xl font-semibold">Order not found</h1>
            <p className="mt-2 text-ink-muted">We could not find this order. Check your email for the order link.</p>
            <div className="mt-6"><Button to="/shop">Continue Shopping</Button></div>
          </div>
        </PageContainer>
      </Section>
    )
  }

  const fd = (d) => new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
  const ft = (d) => new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })

  const currentStepIndex = STEP_ORDER.indexOf(order.orderStatus)

  return (
    <Section>
      <PageContainer>
        {/* Success banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl rounded-3xl border border-lilac-soft bg-brand-gradient-soft px-6 py-10 text-center shadow-soft sm:px-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-pink shadow-soft"
          >
            <CheckCircle size={32} />
          </motion.div>
          <h1 className="mt-5 font-heading text-3xl font-bold text-ink sm:text-4xl">
            Order Confirmed! 🎉
          </h1>
          <p className="mt-2 text-ink-muted">
            Thank you, {order.customerName}. We&apos;ll start preparing your order right away.
          </p>
          <div className="mt-4 inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 shadow-soft">
            <span className="text-sm text-ink-muted">Order</span>
            <span className="text-sm font-bold text-lilac-deep">#{order.orderNumber}</span>
            <span className={'rounded-full px-3 py-1 text-xs font-semibold capitalize ' + (STATUS_STYLES[order.orderStatus] || 'bg-ink/5 text-ink-muted')}>
              {(order.orderStatus || 'pending').replace(/_/g, ' ')}
            </span>
          </div>
        </motion.div>

        <div className="mx-auto mt-8 max-w-3xl space-y-6">
          {/* ─── Status Timeline ─── */}
          {order.orderStatus !== 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-soft"
            >
              <h2 className="font-heading text-lg font-semibold text-ink mb-6">Order Progress</h2>
              <div className="relative">
                {ORDER_STEPS.map((step, i) => {
                  const isActive = i <= currentStepIndex
                  const isCurrent = i === currentStepIndex
                  const Icon = step.icon
                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      {/* Vertical line + dot */}
                      <div className="flex flex-col items-center">
                        <div className={
                          'flex h-10 w-10 items-center justify-center rounded-full transition-all ' +
                          (isActive
                            ? 'bg-brand-gradient text-white shadow-card'
                            : 'bg-lilac-soft/60 text-ink-light')
                          + (isCurrent ? ' ring-4 ring-pink/20' : '')
                        }>
                          <Icon size={18} />
                        </div>
                        {i < ORDER_STEPS.length - 1 && (
                          <div className={
                            'h-8 w-0.5 ' +
                            (i < currentStepIndex ? 'bg-brand-gradient' : 'bg-lilac-soft/60')
                          } />
                        )}
                      </div>
                      {/* Label */}
                      <div className="pt-2">
                        <p className={'text-sm font-semibold ' + (isActive ? 'text-ink' : 'text-ink-light')}>
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-pink mt-0.5">Current status</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {order.orderStatus === 'cancelled' && (
            <div className="rounded-2xl border border-error-soft bg-error-soft/30 p-6 text-center">
              <p className="font-heading text-lg font-bold text-error">Order Cancelled</p>
              <p className="mt-1 text-sm text-ink-muted">This order has been cancelled.</p>
            </div>
          )}

          {/* ─── Order Details ─── */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Delivery info */}
            <div className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-pink" />
                <h3 className="font-heading text-base font-semibold text-ink">
                  {order.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'} Information
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                {order.deliveryMethod === 'delivery' && (
                  <>
                    <div>
                      <p className="text-ink-light text-xs">Address</p>
                      <p className="font-medium text-ink">{order.deliveryAddress || '—'}</p>
                    </div>
                    {(order.deliveryCity || order.deliveryState) && (
                      <div>
                        <p className="text-ink-light text-xs">City / State</p>
                        <p className="font-medium text-ink">{order.deliveryCity}{order.deliveryState ? ', ' + order.deliveryState : ''}</p>
                      </div>
                    )}
                  </>
                )}
                {order.deliveryMethod === 'pickup' && (
                  <div>
                    <p className="text-ink-light text-xs">Pickup Location</p>
                    <p className="font-medium text-ink">Bamzy Cakes & Confectionery</p>
                  </div>
                )}
                {order.deliveryNotes && (
                  <div>
                    <p className="text-ink-light text-xs">Notes</p>
                    <p className="font-medium text-ink">{order.deliveryNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment info */}
            <div className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-pink" />
                <h3 className="font-heading text-base font-semibold text-ink">Payment Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Method</span>
                  <span className="font-medium text-ink capitalize">{order.paymentMethod || 'Paystack'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Status</span>
                  <span className={'rounded-full px-3 py-1 text-xs font-semibold capitalize ' + (PAYMENT_STYLES[order.paymentStatus] || 'bg-ink/5 text-ink-muted')}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.paymentReference && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Reference</span>
                    <span className="font-mono text-xs text-ink">{order.paymentReference}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ink-muted">Date</span>
                  <span className="font-medium text-ink">{fd(order.createdAt)} at {ft(order.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Items ─── */}
          <div className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-soft">
            <h3 className="font-heading text-base font-semibold text-ink mb-4">Items Ordered</h3>
            <div className="space-y-3">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-lilac-50/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img src={getImgUrl(item.imageUrl)} alt={item.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-gradient-soft">
                        <Package size={18} className="text-pink/60" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.name || item.productNameSnapshot}</p>
                      <p className="text-xs text-ink-muted">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-pink">{formatNaira(item.unitPrice * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-2 border-t border-lilac-soft pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Subtotal</span>
                <span className="text-ink">{formatNaira(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Delivery Fee</span>
                <span className="text-ink">{formatNaira(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between border-t border-lilac-soft pt-2">
                <span className="font-bold text-ink">Total</span>
                <span className="text-xl font-bold text-pink">{formatNaira(order.total)}</span>
              </div>
            </div>
          </div>

          {/* ─── Action Buttons ─── */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to="/shop" variant="secondary" className="flex-1">
              <ShoppingBag size={18} /> Continue Shopping
            </Button>
            <Button to="/account" variant="outline" className="flex-1">
              <User size={18} /> My Bamzy
            </Button>
          </div>
        </div>
      </PageContainer>
    </Section>
  )
}

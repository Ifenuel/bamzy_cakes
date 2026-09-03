import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck, Store, CreditCard, AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Button from '../../components/ui/Button.jsx'
import ImagePlaceholder from '../../components/common/ImagePlaceholder.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { apiCreateOrder, apiInitializePayment, apiVerifyPayment, apiTrackEvent, apiCalculateDeliveryFee } from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'
import { getImgUrl } from '../../utils/api.js'
const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

function CheckoutItemImage({ item }) {
  const [imgError, setImgError] = useState(false)
  if (item.image && !imgError) {
    return <img src={getImgUrl(item.image)} alt={item.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" onError={() => setImgError(true)} />
  }
  return <ImagePlaceholder label={item.name} className="h-12 w-12 shrink-0 rounded-lg" iconSize={14} />
}

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [deliveryMethod, setDeliveryMethod] = useState('delivery')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    deliveryNotes: '',
  })
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [calculatingFee, setCalculatingFee] = useState(false)

  const subtotal = getCartTotal()
  const deliveryFee = deliveryMethod === 'delivery' && items.length > 0 ? (deliveryInfo?.fee || 1500) : 0
  const total = subtotal + deliveryFee

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))

    // Recalculate delivery fee when city or state changes
    if ((name === 'city' || name === 'state') && deliveryMethod === 'delivery') {
      const newForm = { ...form, [name]: value }
      if (newForm.city || newForm.state) {
        setCalculatingFee(true)
        apiCalculateDeliveryFee(newForm.city, newForm.state)
          .then((info) => setDeliveryInfo(info))
          .catch(() => setDeliveryInfo(null))
          .finally(() => setCalculatingFee(false))
      }
    }
  }

  function validate() {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.'
    if (!form.phone.trim()) errs.phone = 'Phone number is required.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email.'
    if (deliveryMethod === 'delivery') {
      if (!form.address.trim()) errs.address = 'Delivery address is required.'
      if (!form.city.trim()) errs.city = 'City is required.'
    }
    return errs
  }

  // Double-click protection: track if payment has been initiated
  const [paymentInitiated, setPaymentInitiated] = useState(false)
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (items.length === 0) { showToast('Your cart is empty.', 'error'); return }
    if (isSubmitting || paymentInitiated) return // Prevent double charge

    // Show confirmation dialog first
    setShowPaymentConfirm(true)
  }

  async function confirmPayment() {
    setShowPaymentConfirm(false)
    setIsSubmitting(true)
    setPaymentInitiated(true)
    try {
      const order = await apiCreateOrder({
        customer_name: form.fullName,
        customer_email: form.email,
        customer_phone: form.phone,
        delivery_address: form.address,
        delivery_city: form.city,
        delivery_state: form.state,
        delivery_method: deliveryMethod,
        delivery_notes: form.deliveryNotes,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      })

      apiTrackEvent('order_created', { order_id: order.id, total: order.total, delivery_method: deliveryMethod })

      const payment = await apiInitializePayment({
        email: form.email || 'guest@bamzycakes.com',
        amount: order.total,
        order_id: order.id,
        metadata: { order_number: order.orderNumber, customer_name: form.fullName },
      })

      apiTrackEvent('checkout_started', { order_id: order.id, total: order.total })

      // If payment has authorization_url, open Paystack popup
      if (payment.authorization_url) {
        const popup = window.PaystackPop && window.PaystackPop.setup({
          key: PAYSTACK_KEY,
          email: form.email || 'guest@bamzycakes.com',
          amount: Math.round(order.total * 100),
          currency: 'NGN',
          ref: payment.reference,
          onClose: function () {
            showToast('Payment cancelled. Your order is saved \u2014 you can pay later.', 'info')
            localStorage.setItem('bamzy_checkout_email', form.email || '')
            clearCart()
            navigate('/order/' + order.id)
          },
          callback: function (response) {
            if (callbackFired) return
            callbackFired = true
            handlePaymentVerification(response.reference, order.id)
          },
        })
        if (popup) {
          popup.openIframe()
        } else {
          // Paystack popup not available — try to verify existing reference
          handlePaymentVerification(payment.reference, order.id)
        }
      } else {
        // Idempotent response — existing pending payment, try to verify it
        handlePaymentVerification(payment.reference, order.id)
      }
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePaymentVerification(reference, orderId) {
    try {
      await apiVerifyPayment(reference)
      showToast('Payment successful! 🎉', 'success')
    } catch {
      showToast('Payment received. We will confirm shortly.', 'info')
    }
    localStorage.setItem('bamzy_checkout_email', form.email || '')
    clearCart()
    navigate('/order/' + orderId)
  }

  // Also protect the Paystack popup callback from double-fire
  let callbackFired = false

  if (items.length === 0) {
    return (
      <Section>
        <PageContainer>
          <div className="py-20 text-center">
            <p className="text-5xl">🛒</p>
            <h1 className="mt-4 font-heading text-2xl font-semibold">Your cart is empty</h1>
            <p className="mt-2 text-ink-muted">Add some treats before checking out.</p>
            <div className="mt-6"><Button to="/shop">Shop Today</Button></div>
          </div>
        </PageContainer>
      </Section>
    )
  }

  const ic = 'w-full rounded-xl2 border border-lilac-soft bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-muted/50 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20'
  const ec = 'text-xs text-pink mt-1'

  return (
    <Section>
      <PageContainer>
        <Link to="/cart" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-lilac-deep transition-colors hover:text-pink">
          <ArrowLeft size={16} /> Back to Cart
        </Link>

        <h1 className="font-heading text-3xl font-bold sm:text-4xl">Checkout</h1>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl2 border border-lilac-soft bg-white p-5 shadow-soft">
              <h2 className="font-heading text-lg font-semibold">Delivery Method</h2>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setDeliveryMethod('delivery')}
                  className={'flex flex-1 items-center justify-center gap-2 rounded-xl2 border-2 px-4 py-3 text-sm font-semibold transition-colors ' + (deliveryMethod === 'delivery' ? 'border-pink bg-pink-soft text-pink' : 'border-lilac-soft text-ink-muted hover:border-lilac')}>
                  <Truck size={18} /> Delivery
                </button>
                <button type="button" onClick={() => setDeliveryMethod('pickup')}
                  className={'flex flex-1 items-center justify-center gap-2 rounded-xl2 border-2 px-4 py-3 text-sm font-semibold transition-colors ' + (deliveryMethod === 'pickup' ? 'border-pink bg-pink-soft text-pink' : 'border-lilac-soft text-ink-muted hover:border-lilac')}>
                  <Store size={18} /> Pickup
                </button>
              </div>
              {deliveryMethod === 'pickup' && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 rounded-xl bg-lilac-soft/50 p-3 text-sm text-ink-muted">
                  Pickup at Bamzy Kitchen Studio, Lekki, Lagos. We will confirm your pickup time via phone.
                </motion.p>
              )}
            </div>

            <div className="rounded-xl2 border border-lilac-soft bg-white p-5 shadow-soft">
              <h2 className="font-heading text-lg font-semibold">Customer Information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-ink">Full Name *</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Ada Okafor" className={ic} />
                  {errors.fullName && <p className={ec}>{errors.fullName}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="08012345678" className={ic} />
                  {errors.phone && <p className={ec}>{errors.phone}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink">Email</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="ada@example.com" className={ic} />
                  {errors.email && <p className={ec}>{errors.email}</p>}
                </div>
              </div>
            </div>

            {deliveryMethod === 'delivery' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl2 border border-lilac-soft bg-white p-5 shadow-soft">
                <h2 className="font-heading text-lg font-semibold">Delivery Address</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-ink">Address *</label>
                    <input name="address" value={form.address} onChange={handleChange} placeholder="12 Admiralty Way, Lekki" className={ic} />
                    {errors.address && <p className={ec}>{errors.address}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">City *</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Lagos" className={ic} />
                    {errors.city && <p className={ec}>{errors.city}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink">State</label>
                    <input name="state" value={form.state} onChange={handleChange} placeholder="Lagos" className={ic} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-ink">Delivery Notes</label>
                    <textarea name="deliveryNotes" value={form.deliveryNotes} onChange={handleChange} rows={2} placeholder="Gate code, landmarks..." className={ic + ' resize-none'} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl2 border border-lilac-soft bg-brand-gradient-soft p-6 shadow-soft">
              <h2 className="font-heading text-lg font-bold text-ink">Order Summary</h2>
              <div className="mt-4 max-h-60 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <CheckoutItemImage item={item} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-ink-muted">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-pink">{formatNaira(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-lilac-deep/10 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="font-medium text-ink">{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">
                    Delivery{deliveryInfo?.zone && deliveryMethod === 'delivery' && (
                      <span className="text-xs"> ({deliveryInfo.zone})</span>
                    )}
                  </span>
                  <span className="font-medium text-ink">
                    {calculatingFee ? 'Calculating...' : formatNaira(deliveryFee)}
                  </span>
                </div>
                {deliveryMethod === 'delivery' && deliveryInfo?.zone && (
                  <p className="text-xs text-ink-muted">Est. delivery: {deliveryInfo.hoursMin}-{deliveryInfo.hoursMax} hours</p>
                )}
                <div className="flex justify-between border-t border-lilac-deep/10 pt-2">
                  <span className="font-bold text-ink">Total</span>
                  <span className="text-lg font-bold text-pink">{formatNaira(total)}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={'mt-5 flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-card transition-all ' + (isSubmitting ? 'cursor-not-allowed bg-ink/30' : 'bg-brand-gradient hover:shadow-glow')}>
                <CreditCard size={20} />
                {isSubmitting ? 'Processing...' : 'Pay with Paystack'}
              </button>
              <p className="mt-3 text-center text-xs text-ink-muted">
                Secure payment via Paystack
              </p>
            </div>
          </div>
        </form>

        {/* Payment Confirmation Modal */}
        <AnimatePresence>
          {showPaymentConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4"
              onClick={() => setShowPaymentConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-soft">
                      <AlertTriangle size={20} className="text-warning" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-ink">Confirm Payment</h3>
                  </div>
                  <button onClick={() => setShowPaymentConfirm(false)} className="rounded-full p-1 hover:bg-gray-100">
                    <X size={18} className="text-ink-muted" />
                  </button>
                </div>

                <p className="text-sm text-ink-muted mb-4">
                  You are about to pay <span className="font-bold text-pink">{formatNaira(total)}</span> for your order. This will open the Paystack payment window.
                </p>

                <div className="rounded-xl bg-brand-gradient-subtle p-4 mb-5">
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span className="text-ink-muted truncate mr-2">{item.name} × {item.quantity}</span>
                        <span className="font-medium text-ink shrink-0">{formatNaira(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-muted">Delivery</span>
                        <span className="font-medium text-ink">{formatNaira(deliveryFee)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between border-t border-lilac-deep/10 mt-2 pt-2">
                    <span className="font-bold text-ink">Total</span>
                    <span className="font-bold text-pink">{formatNaira(total)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentConfirm(false)}
                    className="flex-1 rounded-full border-2 border-lilac-soft px-5 py-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-lilac-soft/60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPayment}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow"
                  >
                    <CreditCard size={18} /> Pay {formatNaira(total)}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageContainer>
    </Section>
  )
}

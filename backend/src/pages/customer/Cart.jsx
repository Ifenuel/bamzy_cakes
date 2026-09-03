import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ImagePlaceholder from '../../components/common/ImagePlaceholder.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { getProducts } from '../../services/productService.js'
import { formatNaira } from '../../utils/format.js'
import { getImgUrl, apiGetDeliveryZones } from '../../utils/api.js'

function CartItemImage({ item, product }) {
  const [imgError, setImgError] = useState(false)
  const imageUrl = item.image || product?.imageUrl
  if (imageUrl && !imgError) {
    return <img src={getImgUrl(imageUrl)} alt={item.name} className="h-24 w-24 sm:h-28 sm:w-28 object-cover" onError={() => setImgError(true)} />
  }
  return <ImagePlaceholder label={item.name} className="h-24 w-24 sm:h-28 sm:w-28" iconSize={20} />
}

export default function Cart() {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    getCartTotal,
    getItemCount,
  } = useCart()
  const { showToast } = useToast()
  const [allProducts, setAllProducts] = useState([])
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState(1500)

  useEffect(() => {
    let isMounted = true
    getProducts().then((data) => {
      if (isMounted) setAllProducts(data)
    })
    // Fetch default delivery fee from settings
    apiGetDeliveryZones().then((zones) => {
      if (isMounted && zones?.length > 0) {
        // Use the lowest delivery fee as the default
        const lowestFee = Math.min(...zones.map(z => Number(z.fee) || 1500))
        setDefaultDeliveryFee(lowestFee)
      }
    }).catch(() => {})
    return () => { isMounted = false }
  }, [])

  const productMap = useMemo(() => {
    const map = {}
    allProducts.forEach((p) => { map[p.id] = p })
    return map
  }, [allProducts])

  const subtotal = getCartTotal()
  const itemCount = getItemCount()
  const deliveryFee = items.length > 0 ? defaultDeliveryFee : 0
  const total = subtotal + deliveryFee

  function handleIncrease(item) {
    const stock = productMap[item.productId]?.stock ?? Infinity
    if (item.quantity >= stock) {
      showToast('Only ' + stock + ' available.', 'info')
      return
    }
    increaseQuantity(item.productId)
  }

  function handleDecrease(item) {
    if (item.quantity <= 1) return
    decreaseQuantity(item.productId)
  }

  function handleRemove(item) {
    removeItem(item.productId)
    showToast('Removed from your basket.', 'info')
  }

  function handleClearCart() {
    clearCart()
    showToast('Basket cleared.', 'info')
  }

  if (items.length === 0) {
    return (
      <Section>
        <PageContainer>
          <EmptyState
            icon={ShoppingBag}
            title={'Your basket is waiting \u{1F497}'}
            description="You haven't added anything yet. Let's find something delicious."
            action={<Button to="/shop">Shop Today's Treats</Button>}
          />
        </PageContainer>
      </Section>
    )
  }

  return (
    <Section>
      <PageContainer>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">
              {'Your Sweet Basket \u{1F497}'}
            </h1>
            <p className="mt-1 text-ink-muted">
              {"Everything you've picked from Bamzy, all in one place."}
            </p>
            <p className="mt-1 text-sm font-medium text-ink-muted">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="mt-3 text-sm font-medium text-pink transition-colors hover:text-lilac-deep sm:mt-0"
          >
            Clear Basket
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const product = productMap[item.productId]
                const stock = product?.stock ?? Infinity
                const category = product?.category ?? ''
                const isMaxed = item.quantity >= stock

                return (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, transition: { duration: 0.25 } }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 rounded-xl2 border border-lilac-soft bg-white p-4 shadow-soft sm:p-5"
                  >
                    <div className="flex gap-4">
                      <div className="shrink-0 overflow-hidden rounded-xl">
                        <CartItemImage item={item} product={product} />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <Link to={'/shop/' + item.productId} className="font-heading text-base font-semibold text-ink hover:text-pink">
                            {item.name}
                          </Link>
                          {category && (
                            <Badge tone="lilac" className="mt-1 capitalize">
                              {category.replace('-', ' ')}
                            </Badge>
                          )}
                          <p className="mt-1 text-sm text-ink-muted">
                            {formatNaira(item.price)} each
                          </p>
                        </div>

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-full border border-lilac-soft">
                              <motion.button
                                onClick={() => handleDecrease(item)}
                                disabled={item.quantity <= 1}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Decrease quantity"
                                className={
                                  'flex h-9 w-9 items-center justify-center rounded-full transition-colors ' +
                                  (item.quantity <= 1 ? 'cursor-not-allowed text-ink-muted/40' : 'text-ink hover:bg-lilac-soft')
                                }
                              >
                                <Minus size={14} />
                              </motion.button>
                              <span className="w-10 text-center text-sm font-semibold text-ink">
                                {item.quantity}
                              </span>
                              <motion.button
                                onClick={() => handleIncrease(item)}
                                disabled={isMaxed}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Increase quantity"
                                className={
                                  'flex h-9 w-9 items-center justify-center rounded-full transition-colors ' +
                                  (isMaxed ? 'cursor-not-allowed text-ink-muted/40' : 'text-ink hover:bg-lilac-soft')
                                }
                              >
                                <Plus size={14} />
                              </motion.button>
                            </div>
                            {isMaxed && (
                              <span className="text-xs text-ink-muted">Max {stock}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <p className="text-base font-bold text-pink">
                              {formatNaira(item.price * item.quantity)}
                            </p>
                            <button
                              onClick={() => handleRemove(item)}
                              className="flex items-center gap-1 text-sm font-medium text-ink-muted transition-colors hover:text-pink"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <Link
              to="/shop"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-lilac-deep transition-colors hover:text-pink"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl2 border border-lilac-soft bg-brand-gradient-soft p-6 shadow-soft">
              <h2 className="font-heading text-xl font-bold text-ink">Order Summary</h2>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="font-medium text-ink">{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Delivery</span>
                  <span className="font-medium text-ink">{formatNaira(deliveryFee)}</span>
                </div>
                <div className="border-t border-lilac-deep/10 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-ink">Total</span>
                    <span className="text-lg font-bold text-pink">{formatNaira(total)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-8 py-4 text-base font-semibold text-white shadow-card transition-all hover:shadow-glow"
              >
                Proceed to Checkout
              </Link>

              <p className="mt-3 text-center text-xs text-ink-muted">
                Delivery fee may change at checkout based on location.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </Section>
  )
}

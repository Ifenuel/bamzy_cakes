import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { apiGetWishlist, apiRemoveFromWishlist, getImgUrl } from '../../utils/api.js'
import { formatNaira } from '../../utils/format.js'
import { useToast } from '../../components/ui/Toast.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'

export default function Wishlist() {
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return
    apiGetWishlist()
      .then((data) => { setItems(data); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [isAuthenticated])

  async function handleRemove(productId) {
    try {
      await apiRemoveFromWishlist(productId)
      setItems(prev => prev.filter(item => item.product_id !== productId))
      showToast('Removed from your wishlist', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to remove', 'error')
    }
  }

  function handleAddToCart(item) {
    addItem({
      id: item.product_id,
      name: item.name,
      price: parseFloat(item.price),
      image_url: item.image_url,
      quantity: 1,
    })
    showToast(`${item.name} added to your basket`, 'success')
  }

  if (!isAuthenticated) {
    return (
      <Section>
        <PageContainer>
          <div className="min-h-[50vh] flex items-center justify-center text-center">
            <div>
              <Heart size={48} className="mx-auto mb-4 text-pink-soft" />
              <h1 className="font-heading text-2xl font-bold text-ink">Your Wishlist</h1>
              <p className="mt-2 text-ink-muted">Sign in to see your saved treats.</p>
              <Link to="/login" className="mt-4 inline-flex rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white">Sign In</Link>
            </div>
          </div>
        </PageContainer>
      </Section>
    )
  }

  if (isLoading) return <LoadingSpinner label="Loading your wishlist..." />

  return (
    <>
      <Section background="gradient" className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <PageContainer>
          <div className="mx-auto max-w-xl text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pink-soft/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-pink">
              <Heart size={12} />
              My Wishlist
            </span>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">Saved Treats</h1>
            <p className="mt-3 text-ink-muted">Your favourite Bamzy treats, ready when you are.</p>
          </div>
        </PageContainer>
      </Section>

      <Section>
        <PageContainer>
          {items.length === 0 ? (
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="text-center">
                <Heart size={48} className="mx-auto mb-4 text-pink-soft" />
                <h2 className="font-heading text-xl font-bold text-ink">Your wishlist is empty</h2>
                <p className="mt-2 text-sm text-ink-muted">Browse our treats and tap the heart icon to save your favourites.</p>
                <Link to="/shop" className="mt-5 inline-flex rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-card hover:shadow-glow transition-all">
                  Shop Today&apos;s Treats
                </Link>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <p className="mb-6 text-sm text-ink-muted">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
              <div className="space-y-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 rounded-2xl border border-lilac-soft bg-white p-4 shadow-xs hover:shadow-soft transition-all"
                  >
                    <Link to={`/shop/${item.product_id}`} className="shrink-0">
                      <img
                        src={getImgUrl(item.image_url)}
                        alt={item.name}
                        className="h-20 w-20 rounded-xl object-cover"
                        onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%23F8F4FD" width="80" height="80"/><text x="50%" y="55%" text-anchor="middle" fill="%23A97BD6" font-size="24">🧁</text></svg>' }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/shop/${item.product_id}`} className="text-sm font-semibold text-ink hover:text-pink transition-colors">
                        {item.name}
                      </Link>
                      {item.categoryName && (
                        <p className="text-xs text-ink-muted mt-0.5">{item.categoryName}</p>
                      )}
                      <p className="mt-1 text-base font-bold text-pink">{formatNaira(item.price)}</p>
                      {item.stock <= 0 && (
                        <p className="text-xs text-error mt-1">Out of stock</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.stock <= 0}
                        className="flex items-center gap-1.5 rounded-full bg-brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart size={14} />
                        Add to Basket
                      </button>
                      <button
                        onClick={() => handleRemove(item.product_id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-lilac-soft text-ink-muted transition-colors hover:bg-error-soft hover:text-error hover:border-error/30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </PageContainer>
      </Section>
    </>
  )
}

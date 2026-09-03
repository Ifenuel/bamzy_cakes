import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Eye } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { formatNaira } from '../../utils/format.js'
import { getImgUrl } from '../../utils/api.js'

export default function ProductCard({ product }) {
  const { items, addItem } = useCart()
  const { showToast } = useToast()
  const [justAdded, setJustAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const isSoldOut = product.stock <= 0
  const quantityInCart = items.find((item) => item.productId === product.id)?.quantity || 0
  const isLowStock = product.stock > 0 && product.stock <= 3
  const isMaxedInCart = quantityInCart >= product.stock
  const hasImage = product.imageUrl && !imgError

  function handleAddToCart() {
    if (isSoldOut || isMaxedInCart) return
    addItem(product, 1)
    showToast(`${product.name} added to your cart`, 'success')
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 600)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-lilac-soft bg-white shadow-soft transition-shadow hover:shadow-card">
      <Link to={`/shop/${product.id}`} className="block overflow-hidden">
        <div className="relative overflow-hidden">
          <div className="transition-transform duration-300 group-hover:scale-105">
            {hasImage ? (
              <img
                src={getImgUrl(product.imageUrl)}
                alt={product.name}
                className="aspect-square w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="upload-placeholder aspect-square w-full">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-lilac/40">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-[10px] font-medium text-lilac/50">No image uploaded</span>
              </div>
            )}
          </div>
          {isSoldOut && (
            <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <Badge tone="lilac" className="w-fit capitalize">
          {product.category?.replace('-', ' ')}
        </Badge>

        <Link to={`/shop/${product.id}`}>
          <h3 className="font-heading text-base font-semibold text-ink transition-colors hover:text-pink">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-2 text-sm text-ink-muted">
          {product.description}
        </p>

        <p className="text-lg font-bold text-pink">
          {formatNaira(product.price)}
        </p>

        {isSoldOut ? (
          <p className="text-sm font-medium text-ink-muted">Currently unavailable</p>
        ) : isLowStock ? (
          <p className="text-sm font-semibold text-pink">Only {product.stock} left</p>
        ) : quantityInCart > 0 ? (
          <p className="text-sm text-ink-muted">
            {quantityInCart} in your cart &middot; {product.stock - quantityInCart} remaining
          </p>
        ) : (
          <p className="text-sm text-ink-muted">{product.stock} available</p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={isSoldOut || isMaxedInCart}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              justAdded ? 'scale-[0.97]' : ''
            } ${
              isSoldOut || isMaxedInCart
                ? 'cursor-not-allowed bg-ink/5 text-ink-muted'
                : 'bg-brand-gradient text-white shadow-sm hover:shadow-card'
            }`}
          >
            <ShoppingBag size={15} />
            {isSoldOut ? 'Sold Out' : isMaxedInCart ? 'Max in Cart' : 'Add to Cart'}
          </button>

          <Link
            to={`/shop/${product.id}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-lilac-soft px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-lilac-soft/50 hover:text-ink"
          >
            <Eye size={15} />
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

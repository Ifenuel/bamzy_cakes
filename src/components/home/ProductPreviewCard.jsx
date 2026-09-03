import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../ui/Toast.jsx'
import { formatNaira } from '../../utils/format.js'
import { getImgUrl } from '../../utils/api.js'

export default function ProductPreviewCard({ product }) {
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [justAdded, setJustAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const isSoldOut = product.stock <= 0
  const hasImage = product.imageUrl && !imgError

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    if (isSoldOut) return
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
              Sold out
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="inline-block w-fit rounded-full bg-lilac-soft/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-lilac-deep">
          {product.category?.replace('-', ' ')}
        </span>
        <Link to={`/shop/${product.id}`}>
          <h3 className="font-heading text-base font-semibold text-ink transition-colors hover:text-pink">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm font-bold text-pink">{formatNaira(product.price)}</p>

        <button
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className={`mt-auto flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            justAdded ? 'scale-[0.97]' : ''
          } ${
            isSoldOut
              ? 'cursor-not-allowed bg-ink/5 text-ink-muted'
              : 'bg-brand-gradient text-white shadow-sm hover:shadow-card'
          }`}
        >
          <ShoppingBag size={15} />
          {isSoldOut ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ShoppingBag, Minus, Plus, ChevronRight,
  Sparkles, Leaf, Package, Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import ImagePlaceholder from '../../components/common/ImagePlaceholder.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import ProductCard from '../../components/shop/ProductCard.jsx'
import { apiGetProductById, apiGetProducts } from '../../utils/api.js'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { formatNaira } from '../../utils/format.js'
import { getImgUrl, apiTrackEvent, apiGetProductImages } from '../../utils/api.js'

export default function ProductDetails() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { items, addItem } = useCart()
  const { showToast } = useToast()
  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [extraImages, setExtraImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    let ok = true
    setIsLoading(true)
    setProduct(null)
    setQuantity(1)
    setSelectedImage(null)
    setExtraImages([])
    apiGetProductById(productId).then((data) => {
      if (ok) {
        setProduct(data)
        setIsLoading(false)
        setSelectedImage(data.imageUrl || null)
        apiTrackEvent('product_view', { product_id: data.id, product_name: data.name, category: data.category })
        // Load additional images
        apiGetProductImages(data.id).then((imgs) => {
          if (ok && imgs && imgs.length > 0) {
            setExtraImages(imgs)
          }
        }).catch(() => {})
      }
    })
    return () => { ok = false }
  }, [productId])

  useEffect(() => {
    let ok = true
    apiGetProducts().then((data) => { if (ok) setAllProducts(data) })
    return () => { ok = false }
  }, [])

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id && p.status === 'active')
      .slice(0, 4)
  }, [product, allProducts])

  if (isLoading) return <LoadingSpinner label="Loading product..." />

  if (!product) {
    return (
      <Section><PageContainer>
        <div className="py-20 text-center">
          <p className="text-5xl">💗</p>
          <h1 className="mt-4 font-heading text-2xl font-semibold">Treat not found 💗</h1>
          <p className="mt-2 text-ink-muted">We couldn&apos;t find that product.</p>
          <div className="mt-6"><Button to="/shop">Back to Shop</Button></div>
        </div>
      </PageContainer></Section>
    )
  }

  const isSoldOut = product.stock <= 0
  const quantityInCart = items.find((item) => item.productId === product.id)?.quantity || 0
  const isLowStock = product.stock > 0 && product.stock <= 3
  const maxQuantity = product.stock

  function handleDecrease() { setQuantity((q) => Math.max(1, q - 1)) }
  function handleIncrease() { setQuantity((q) => Math.min(maxQuantity, q + 1)) }
  function handleAddToCart() {
    if (isSoldOut) return
    addItem(product, quantity)
    showToast(`${product.name} added to your cart 💗`, 'success')
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 600)
  }
  function handleBuyNow() {
    if (isSoldOut) return
    addItem(product, quantity)
    showToast(`${product.name} added to your cart 💗`, 'success')
    navigate('/cart')
  }

  return (
    <>
      <Section>
        <PageContainer>
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <Link to="/" className="hover:text-pink">Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop" className="hover:text-pink">Shop Today</Link>
            <ChevronRight size={14} />
            <span className="font-medium text-ink">{product.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
            {/* Product image gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {/* Main image */}
              <div className="group relative overflow-hidden rounded-xl2 shadow-soft">
                <div className="transition-transform duration-500 group-hover:scale-105">
                  {selectedImage ? (
                    <img src={getImgUrl(selectedImage)} alt={product.name}
                      className="aspect-square w-full object-cover" />
                  ) : (
                    <ImagePlaceholder label={product.name} className="aspect-square w-full" iconSize={48} />
                  )}
                </div>
                {isSoldOut && (
                  <span className="absolute right-4 top-4 rounded-full bg-ink/80 px-4 py-1.5 text-xs font-semibold uppercase text-white">Sold Out</span>
                )}
              </div>
              {/* Thumbnails */}
              {extraImages.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                  {/* Primary image thumbnail */}
                  <button onClick={() => setSelectedImage(product.imageUrl)}
                    className={'shrink-0 overflow-hidden rounded-lg border-2 transition-colors ' + (selectedImage === product.imageUrl ? 'border-pink' : 'border-transparent hover:border-lilac')}>
                    <img src={getImgUrl(product.imageUrl)} alt="" className="h-16 w-16 object-cover sm:h-20 sm:w-20" />
                  </button>
                  {extraImages.map((img) => (
                    <button key={img.id} onClick={() => setSelectedImage(img.imageUrl)}
                      className={'shrink-0 overflow-hidden rounded-lg border-2 transition-colors ' + (selectedImage === img.imageUrl ? 'border-pink' : 'border-transparent hover:border-lilac')}>
                      <img src={getImgUrl(img.imageUrl)} alt="" className="h-16 w-16 object-cover sm:h-20 sm:w-20" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="flex flex-col gap-5">
              <Badge tone="lilac" className="w-fit capitalize">{product.category?.replace('-', ' ')}</Badge>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl">{product.name}</h1>
              <p className="text-ink-muted leading-relaxed">{product.description}</p>
              <p className="text-2xl font-bold text-pink">{formatNaira(product.price)}</p>

              {isSoldOut ? (
                <p className="text-sm font-medium text-ink-muted">Currently unavailable</p>
              ) : isLowStock ? (
                <p className="text-sm font-semibold text-pink">Only {product.stock} left — order soon!</p>
              ) : quantityInCart > 0 ? (
                <p className="text-sm text-ink-muted">{quantityInCart} already in your cart · {product.stock} available</p>
              ) : (
                <p className="text-sm text-ink-muted">{product.stock} available</p>
              )}

              {!isSoldOut && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-ink-muted">Quantity</span>
                  <div className="flex items-center rounded-full border border-lilac-soft">
                    <motion.button onClick={handleDecrease} disabled={quantity <= 1} whileTap={{ scale: 0.9 }}
                      className={'flex h-10 w-10 items-center justify-center rounded-full ' + (quantity <= 1 ? 'cursor-not-allowed text-ink-muted/40' : 'text-ink hover:bg-lilac-soft')}>
                      <Minus size={16} />
                    </motion.button>
                    <span className="w-12 text-center text-base font-semibold text-ink">{quantity}</span>
                    <motion.button onClick={handleIncrease} disabled={quantity >= maxQuantity} whileTap={{ scale: 0.9 }}
                      className={'flex h-10 w-10 items-center justify-center rounded-full ' + (quantity >= maxQuantity ? 'cursor-not-allowed text-ink-muted/40' : 'text-ink hover:bg-lilac-soft')}>
                      <Plus size={16} />
                    </motion.button>
                  </div>
                  {quantity >= maxQuantity && <span className="text-xs text-ink-muted">Max {maxQuantity}</span>}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <motion.button onClick={handleAddToCart} disabled={isSoldOut} whileTap={{ scale: 0.96 }}
                  animate={justAdded ? { scale: [1, 1.05, 1] } : {}}
                  className={'flex flex-1 items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold transition-colors ' + (isSoldOut ? 'cursor-not-allowed bg-ink/10 text-ink-muted' : 'bg-brand-gradient text-white shadow-card hover:shadow-glow')}>
                  <ShoppingBag size={20} />{isSoldOut ? 'Sold Out' : 'Add to Cart 💗'}
                </motion.button>
                {!isSoldOut && (
                  <motion.button onClick={handleBuyNow} whileTap={{ scale: 0.96 }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-lilac-deep/30 px-8 py-4 text-base font-semibold text-lilac-deep hover:bg-lilac-soft">
                    <Zap size={20} />Buy Now
                  </motion.button>
                )}
              </div>

              <Link to="/shop" className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-lilac-deep hover:text-pink">
                <ArrowLeft size={16} />Continue Shopping
              </Link>

              <div className="mt-2 grid grid-cols-3 gap-3 rounded-xl2 border border-lilac-soft bg-brand-gradient-soft p-5">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Sparkles size={20} className="text-pink" />
                  <span className="text-xs font-medium text-ink">Freshly Made</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Leaf size={20} className="text-pink" />
                  <span className="text-xs font-medium text-ink">Quality Ingredients</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Package size={20} className="text-pink" />
                  <span className="text-xs font-medium text-ink">Carefully Packaged</span>
                </div>
              </div>
            </motion.div>
          </div>
        </PageContainer>
      </Section>

      {relatedProducts.length > 0 && (
        <Section background="soft">
          <PageContainer>
            <h2 className="text-2xl font-bold sm:text-3xl">You Might Also Like 💗</h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </PageContainer>
        </Section>
      )}
    </>
  )
}

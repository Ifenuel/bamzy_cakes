import { useState, useEffect, useMemo } from 'react'
import SEO from "../../components/common/SEO.jsx"
import { useSearchParams } from 'react-router-dom'
import { Search, ShoppingBag } from 'lucide-react'
import PageContainer from '../../components/layout/PageContainer.jsx'
import ProductCard from '../../components/shop/ProductCard.jsx'
import CategoryFilter from '../../components/shop/CategoryFilter.jsx'
import SortSelect from '../../components/shop/SortSelect.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import Button from '../../components/ui/Button.jsx'
import { apiGetProducts } from '../../utils/api.js'

const CATEGORIES = [
  { slug: 'all', label: 'All' },
  { slug: 'cakes', label: 'Cakes' },
  { slug: 'pastries', label: 'Pastries' },
  { slug: 'tiger-nuts', label: 'Tiger Nuts' },
  { slug: 'drinks', label: 'Drinks' },
]

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
]

export default function ShopToday() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('recommended')

  const activeCategory = searchParams.get('category') || 'all'

  useEffect(() => {
    let isMounted = true
    apiGetProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Could not load products. Please check your connection and try again.')
          setIsLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [])

  const availableProducts = useMemo(
    () => products.filter((p) => p.availableToday && p.status === 'active'),
    [products],
  )

  const categoryFiltered = useMemo(() => {
    if (activeCategory === 'all') return availableProducts
    return availableProducts.filter((p) => p.category === activeCategory)
  }, [availableProducts, activeCategory])

  const searchFiltered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return categoryFiltered
    return categoryFiltered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.replace('-', ' ').includes(query),
    )
  }, [categoryFiltered, search])

  const sortedProducts = useMemo(() => {
    const sorted = [...searchFiltered]
    switch (sortBy) {
      case 'price-low': return sorted.sort((a, b) => a.price - b.price)
      case 'price-high': return sorted.sort((a, b) => b.price - a.price)
      case 'newest': return sorted.reverse()
      default: return sorted
    }
  }, [searchFiltered, sortBy])

  function handleCategorySelect(slug) {
    if (slug === 'all') setSearchParams({})
    else setSearchParams({ category: slug })
  }

  function handleClearFilters() {
    setSearch('')
    setSearchParams({})
  }

  return (
    <>
      <SEO title="Shop Today" description="Browse our selection of cakes, pastries, small chops and treats. Order online for fast delivery across Southwest Nigeria." />
      {/* Header */}
      <section className="bg-brand-gradient-soft py-10 sm:py-14">
        <PageContainer>
          <p className="text-sm font-semibold uppercase tracking-widest text-lilac-deep">
            Bamzy&apos;s Kitchen
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            What&apos;s Available Today?
          </h1>
          <p className="mt-3 max-w-lg text-ink-muted">
            Freshly made treats, pastries and goodies ready for you.
          </p>
        </PageContainer>
      </section>

      {/* Search + Filters */}
      <section className="border-b border-lilac-soft/40 bg-white py-6">
        <PageContainer>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search for something delicious..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-lilac-soft bg-white py-3 pl-11 pr-4 text-sm text-ink shadow-xs transition-colors placeholder:text-ink-muted/50 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20"
            />
          </div>
          <div className="mt-4">
            <CategoryFilter
              categories={CATEGORIES}
              activeSlug={activeCategory}
              onSelect={handleCategorySelect}
            />
          </div>
        </PageContainer>
      </section>

      {/* Results + Sort */}
      <section className="bg-white py-4">
        <PageContainer>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-ink-muted">
              {sortedProducts.length} treat{sortedProducts.length !== 1 ? 's' : ''} available
            </p>
            <SortSelect options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
          </div>
        </PageContainer>
      </section>

      {/* Products Grid */}
      <section className="bg-white pb-16 pt-2 sm:pb-20">
        <PageContainer>
          {isLoading ? (
            <LoadingSpinner label="Loading today's treats..." />
          ) : error ? (
            <EmptyState
              icon={ShoppingBag}
              title="Something went wrong"
              description={error}
              action={
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              }
            />
          ) : sortedProducts.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No treats available right now"
              description="We're busy baking something amazing! Please check back later — new treats are added daily."
              action={
                <Button variant="outline" onClick={handleClearFilters}>
                  View All
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </PageContainer>
      </section>
    </>
  )
}

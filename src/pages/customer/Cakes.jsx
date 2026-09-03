import { useState, useEffect, useMemo } from 'react'
import SEO from "../../components/common/SEO.jsx"
import { Search, CakeSlice } from 'lucide-react'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import ProductCard from '../../components/shop/ProductCard.jsx'
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { apiGetProducts } from '../../utils/api.js'

export default function Cakes() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true
    apiGetProducts().then((data) => {
      if (isMounted) { setProducts(data); setIsLoading(false) }
    })
    return () => { isMounted = false }
  }, [])

  const cakes = useMemo(() => {
    const allCakes = products.filter((p) => p.category === 'cakes' && p.status === 'active')
    const q = search.trim().toLowerCase()
    if (!q) return allCakes
    return allCakes.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }, [products, search])

  return (
    <>
      <SEO title="Cakes" description="Beautiful cakes for every occasion — birthdays, weddings, celebrations. Order from Bamzy Cakes & Confectionery." />
      <Section background="gradient" className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <PageContainer>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-pink shadow-soft">
              <CakeSlice size={24} />
            </span>
            <div>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">Beautiful Cakes</h1>
              <p className="mt-1 text-ink-muted">Custom celebration cakes made with love for every occasion.</p>
            </div>
          </div>
        </PageContainer>
      </Section>
      <Section className="pt-6 pb-0 sm:pt-8 sm:pb-0">
        <PageContainer>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input type="text" placeholder="Search cakes..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-lilac-soft bg-white py-3 pl-11 pr-4 text-sm text-ink shadow-soft transition-colors placeholder:text-ink-muted/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20" />
          </div>
        </PageContainer>
      </Section>
      <Section className="pt-6 pb-14 sm:pt-8 sm:pb-20">
        <PageContainer>
          {isLoading ? (
            <LoadingSpinner label="Loading cakes..." />
          ) : cakes.length === 0 ? (
            <EmptyState icon={CakeSlice} title="No cakes found" description="Try a different search or check back soon." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {cakes.map((product) => (<ProductCard key={product.id} product={product} />))}
            </div>
          )}
        </PageContainer>
      </Section>
    </>
  )
}

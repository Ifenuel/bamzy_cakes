import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import ProductPreviewCard from './ProductPreviewCard.jsx'
import LoadingSpinner from '../ui/LoadingSpinner.jsx'
import ScrollReveal, { StaggerContainer, StaggerItem } from '../ui/ScrollReveal.jsx'
import { getProductsAvailableToday } from '../../services/productService.js'

export default function AvailableToday() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getProductsAvailableToday().then((data) => {
      if (isMounted) {
        setProducts(data)
        setIsLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [])

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial header */}
        <ScrollReveal preset="fadeUp">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-pink">
                <Clock size={12} />
                Fresh Today
              </span>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
                Today&apos;s Treats
              </h2>
              <p className="mt-2 max-w-md text-ink-muted">
                Freshly baked and ready for you. Grab them before they&apos;re gone.
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden items-center gap-1.5 text-sm font-semibold text-pink transition-colors hover:text-lilac-deep sm:inline-flex group"
            >
              View Full Menu <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </ScrollReveal>

        {/* Product teaser — only first 3-4 items */}
        <div className="mt-10">
          {isLoading ? (
            <LoadingSpinner label="Loading today's treats..." />
          ) : products.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-ink-muted">Check back soon for today&apos;s fresh treats.</p>
            </div>
          ) : (
            <>
              <StaggerContainer
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                stagger={0.08}
              >
                {products.slice(0, 4).map((product) => (
                  <StaggerItem key={product.id}>
                    <ProductPreviewCard product={product} />
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* Big CTA — go to full shop */}
              <ScrollReveal preset="fadeUp" delay={0.3}>
                <div className="mt-12 text-center">
                  <Link
                    to="/shop"
                    className="group inline-flex items-center gap-2 rounded-full bg-brand-gradient px-8 py-3.5 text-sm font-semibold text-white shadow-card transition-all hover:shadow-glow"
                  >
                    Browse Full Menu
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <p className="mt-3 text-xs text-ink-muted">
                    {products.length} product{products.length !== 1 ? 's' : ''} available today
                  </p>
                </div>
              </ScrollReveal>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

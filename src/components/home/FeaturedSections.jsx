import { useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { getImgUrl, apiGetSettings } from '../../utils/api.js'
import ScrollReveal from '../ui/ScrollReveal.jsx'

const DEFAULT_SECTIONS = [
  {
    title: 'Events & Catering',
    description: 'Birthdays, weddings, outdoor events and celebrations — Bamzy has you covered.',
    to: '/events',
    img: '',
    cta: 'Plan Your Event',
  },
  {
    title: 'Baking Trainings',
    description: 'Learn the art of baking with hands-on practical classes from our expert team.',
    to: '/trainings',
    img: '',
    cta: 'Explore Classes',
  },
  {
    title: 'About Bamzy',
    description: 'A story of passion, flavour and Nigerian sweetness — meet the woman behind the treats.',
    to: '/about',
    img: '',
    cta: 'Our Story',
  },
]

function SectionCard({ section, index, className = '' }) {
  const [error, setError] = useState(false)
  const hasImage = section.img && !error

  return (
    <ScrollReveal
      preset="scaleUp"
      delay={index * 0.12}
      className={className}
    >
      <Link
        to={section.to}
        className="group relative flex h-full overflow-hidden rounded-2xl bg-ink"
      >
        {/* Image */}
        <div className="absolute inset-0">
          {hasImage ? (
            <img
              src={getImgUrl(section.img)}
              alt={section.title}
              className="h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-110 group-hover:opacity-50"
              onError={() => setError(true)}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-lilac-soft to-pink-soft opacity-40 transition-all duration-700 group-hover:scale-110" />
          )}
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-end p-6 sm:p-8">
          <motion.p
            className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-white/60"
          >
            {section.title}
          </motion.p>
          <h3 className="font-heading text-2xl font-bold text-white sm:text-3xl transition-transform duration-300 group-hover:translate-x-1">
            {section.title}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/75">
            {section.description}
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 group-hover:border-white/60 group-hover:bg-white/10 group-hover:translate-x-1">
              {section.cta} →
            </span>
          </div>
        </div>
      </Link>
    </ScrollReveal>
  )
}

export default function FeaturedSections() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS)

  useEffect(() => {
    apiGetSettings().then((s) => {
      if (Array.isArray(s?.featured_sections) && s.featured_sections.length > 0) {
        setSections(s.featured_sections.map((sec, i) => ({
          ...DEFAULT_SECTIONS[i],
          ...sec,
          to: DEFAULT_SECTIONS[i]?.to || '/shop',
          cta: DEFAULT_SECTIONS[i]?.cta || 'Learn More',
        })))
      }
    }).catch(() => {})
  }, [])

  return (
    <section className="bg-brand-gradient-subtle py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal preset="fadeUp" className="mx-auto max-w-lg text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-pink">
            Explore Bamzy
          </p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            More than just cakes
          </h2>
          <p className="mt-3 text-ink-muted">
            From custom celebrations to hands-on baking classes — discover everything Bamzy has to offer.
          </p>
        </ScrollReveal>

        {/* Editorial asymmetric grid */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, i) => (
            <SectionCard
              key={section.title}
              section={section}
              index={i}
              className={i === 0 ? 'min-h-[320px] sm:min-h-[400px] lg:row-span-2 lg:min-h-0' : 'min-h-[280px] sm:min-h-[320px]'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import ScrollReveal from '../ui/ScrollReveal.jsx'

const BENEFITS = [
  {
    number: '01',
    title: 'Freshly Made',
    description: 'Every treat is baked fresh daily using premium ingredients. No preservatives, no shortcuts — just genuine quality you can taste.',
  },
  {
    number: '02',
    title: 'Made With Love',
    description: 'From our kitchen to your table, every product is prepared with care, attention and the passion that makes Bamzy special.',
  },
  {
    number: '03',
    title: 'For Every Moment',
    description: 'Whether it is a quick snack, a birthday celebration or a grand wedding — Bamzy has the perfect treat for every occasion.',
  },
  {
    number: '04',
    title: 'Easy & Convenient',
    description: 'Order online, choose delivery or pickup, and enjoy your treats without leaving the comfort of your home.',
  },
  {
    number: '05',
    title: 'Customer Care',
    description: 'We treat every customer like family. Responsive support, careful packaging and a genuine commitment to your satisfaction.',
  },
]

function BenefitItem({ benefit, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group flex gap-6 border-b border-lilac-soft/60 py-6 last:border-b-0 sm:gap-8 sm:py-8"
    >
      {/* Large number — color shift on hover */}
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, delay: index * 0.12 + 0.1 }}
        className="shrink-0 font-heading text-4xl font-bold text-lilac-soft transition-colors duration-500 group-hover:text-pink sm:text-5xl"
      >
        {benefit.number}
      </motion.span>

      {/* Content — slides in from right */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.5, delay: index * 0.12 + 0.15 }}
      >
        <h3 className="font-heading text-xl font-bold text-ink sm:text-2xl transition-colors duration-300 group-hover:text-pink">
          {benefit.title}
        </h3>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
          {benefit.description}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default function WhyChooseSection() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section className="py-16 sm:py-24" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
          {/* Left — Heading (sticky) */}
          <ScrollReveal preset="fadeRight" className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-pink">
              Our Promise
            </p>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
              Why Choose
              <br />
              <span className="text-gradient">Bamzy?</span>
            </h2>
            <p className="mt-4 text-ink-muted">
              More than a bakery — we are a celebration of flavour, quality and love.
            </p>
          </ScrollReveal>

          {/* Right — Numbered benefits with individual scroll reveals */}
          <div className="lg:col-span-8">
            {BENEFITS.map((benefit, i) => (
              <BenefitItem key={benefit.number} benefit={benefit} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

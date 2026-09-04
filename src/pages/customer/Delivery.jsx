import { Truck, Clock, MapPin, Package, CheckCircle, ArrowRight, ShieldCheck, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Button from '../../components/ui/Button.jsx'

const STEPS = [
  { step: '01', title: 'Place Your Order', desc: 'Browse our treats, add to your basket, and checkout. Choose delivery or pickup.', icon: Package },
  { step: '02', title: 'We Prepare & Pack', desc: 'Our kitchen freshly prepares and carefully packages your order with love.', icon: CheckCircle },
  { step: '03', title: 'Delivered to You', desc: 'Your treats arrive at your doorstep, fresh and ready to enjoy.', icon: Truck },
]

const ZONES = [
  { area: 'Ibadan (Within City)', time: '2–4 hours', fee: 'Standard', highlight: true },
  { area: 'Lagos', time: '24–48 hours', fee: 'Calculated at checkout' },
  { area: 'Ogun State', time: '24–48 hours', fee: 'Calculated at checkout' },
  { area: 'Ondo, Ekiti, Osun', time: '24–48 hours', fee: 'Calculated at checkout' },
]

export default function Delivery() {
  return (
    <>
      {/* Hero */}
      <Section background="gradient" className="pt-10 pb-12 sm:pt-14 sm:pb-16">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pink-soft/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-pink">
              <Truck size={12} />
              Delivery & Pickup
            </span>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
              Fresh to Your Doorstep
            </h1>
            <p className="mt-4 text-lg text-ink-muted">
              We deliver across Southwest Nigeria — your favourite treats, handled with care.
            </p>
          </motion.div>
        </PageContainer>
      </Section>

      {/* How It Works */}
      <Section className="relative -mt-4">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">How It Works</h2>
            <p className="mt-2 text-ink-muted">Three simple steps from order to your doorstep.</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3 relative">
            {/* Connection line */}
            <div className="absolute top-10 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-lilac-soft via-pink/30 to-lilac-soft hidden sm:block" />

            {STEPS.map(({ step, title, desc, icon: Icon }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative mx-auto mb-5">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-xl font-bold text-white shadow-lg">
                    {step}
                  </span>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                    <Icon size={12} className="text-pink" />
                  </div>
                </div>
                <h3 className="font-heading text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm text-ink-muted max-w-xs mx-auto">{desc}</p>
              </motion.div>
            ))}
          </div>
        </PageContainer>
      </Section>

      {/* Delivery Zones */}
      <Section background="soft">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Delivery Areas & Times</h2>
            <p className="mt-2 text-ink-muted">We cover all of Southwest Nigeria.</p>
          </motion.div>

          <div className="mx-auto max-w-3xl space-y-3">
            {ZONES.map(({ area, time, fee, highlight }, i) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border bg-white p-5 shadow-xs transition-all sm:gap-6 ${
                  highlight ? 'border-pink/30 ring-1 ring-pink/10' : 'border-lilac-soft'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    highlight ? 'bg-gradient-to-br from-pink to-pink/80 text-white' : 'bg-lilac-soft text-lilac-deep'
                  }`}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{area}</p>
                    {highlight && <span className="text-[10px] font-bold uppercase tracking-wider text-pink">Most Popular</span>}
                  </div>
                </div>
                <div className="flex items-center gap-6 pl-13 sm:pl-0">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-ink-light">Delivery Time</p>
                    <p className="text-sm font-semibold text-ink">{time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-ink-light">Fee</p>
                    <p className="text-sm font-medium text-ink">{fee}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </PageContainer>
      </Section>

      {/* Pickup + Guarantee */}
      <Section>
        <PageContainer>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Pickup */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lilac-soft text-lilac-deep mb-4">
                <Package size={20} />
              </div>
              <h3 className="font-heading text-lg font-bold text-ink">Pickup Option</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                Prefer to collect? Choose <strong>Pickup</strong> at checkout. We&apos;ll confirm your pickup time and share our location details via phone. Pickup orders have <strong>no delivery fee</strong>.
              </p>
            </motion.div>

            {/* Guarantee */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-heading text-lg font-bold text-ink">Freshness Guarantee</h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                Every order is packaged with care to maintain freshness during transit. If anything arrives less than perfect, reach out to us and we&apos;ll make it right.
              </p>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 rounded-2xl bg-gradient-to-br from-lilac to-pink p-8 text-center text-white sm:p-10"
          >
            <h2 className="font-heading text-2xl font-bold sm:text-3xl">Ready to Order?</h2>
            <p className="mt-2 text-sm text-white/80 max-w-md mx-auto">Browse our freshly baked treats and have them delivered to your doorstep today.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button to="/shop" variant="white" size="lg">Shop Today&apos;s Treats</Button>
              <a
                href="https://wa.me/2347033374470?text=Hi%20Bamzy!%20I%20have%20a%20delivery%20question."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                <Phone size={16} />
                Questions? Chat with Us
              </a>
            </div>
          </motion.div>
        </PageContainer>
      </Section>
    </>
  )
}

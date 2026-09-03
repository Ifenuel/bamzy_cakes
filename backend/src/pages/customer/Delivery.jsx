import { Truck, Clock, MapPin, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Button from '../../components/ui/Button.jsx'

const DELIVERY_INFO = [
  { icon: Truck, title: 'Fast Delivery', desc: 'We deliver across Southwest Nigeria. Within Ibadan: 2-4 hours. Other Southwest states: 24-48 hours after order confirmation.' },
  { icon: Clock, title: 'Delivery Hours', desc: 'Monday to Saturday: 9:00 AM - 7:00 PM. Sunday: 10:00 AM - 5:00 PM.' },
  { icon: MapPin, title: 'Delivery Areas', desc: 'We deliver across Southwest Nigeria — Ibadan, Lagos, Ogun, Ondo, Ekiti, and Osun states. Delivery fees are calculated at checkout based on your location.' },
  { icon: Package, title: 'Careful Packaging', desc: 'Every order is carefully packaged to ensure your treats arrive fresh and in perfect condition.' },
]

export default function Delivery() {
  return (
    <>
      <Section background="gradient" className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <PageContainer>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-pink shadow-soft">
              <Truck size={24} />
            </span>
            <div>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">Delivery Information</h1>
              <p className="mt-1 text-ink-muted">How we get your treats to you, fresh and on time.</p>
            </div>
          </div>
        </PageContainer>
      </Section>

      <Section className="pt-8 pb-14 sm:pt-10 sm:pb-20">
        <PageContainer>
          <div className="mx-auto max-w-4xl">
            {/* How It Works */}
            <div className="mb-12">
              <h2 className="text-center font-heading text-2xl font-bold sm:text-3xl">How Delivery Works</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                {[
                  { step: '01', title: 'Place Your Order', desc: 'Browse our treats, add to your basket, and proceed to checkout.' },
                  { step: '02', title: 'We Prepare & Pack', desc: 'Our team freshly prepares and carefully packages your order.' },
                  { step: '03', title: 'Delivered to You', desc: 'Your treats arrive at your doorstep, fresh and ready to enjoy.' },
                ].map(({ step, title, desc }, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-lg font-bold text-white">{step}</span>
                    <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{title}</h3>
                    <p className="mt-2 text-sm text-ink-muted">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Delivery Info Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {DELIVERY_INFO.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4 rounded-xl2 border border-lilac-soft bg-white p-5 shadow-soft"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-soft text-pink">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-ink">{title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Delivery Fee Note */}
            <div className="mt-10 rounded-xl2 border border-lilac-soft bg-brand-gradient-soft p-6 text-center">
              <h3 className="font-heading text-lg font-bold text-ink">Delivery Fees</h3>
              <div className="mt-3 space-y-2 text-sm text-ink-muted">
                <p>Delivery fees are calculated at checkout based on your location:</p>
                <ul className="ml-4 list-inside list-disc space-y-1">
                  <li><strong className="text-ink">Within Ibadan:</strong> Standard delivery fee (lower rate)</li>
                  <li><strong className="text-ink">Other Southwest Nigeria:</strong> Calculated based on distance (Lagos, Ogun, Ondo, Ekiti, Osun)</li>
                  <li><strong className="text-ink">Pickup:</strong> Free — no delivery fee</li>
                </ul>
                <p>The exact delivery fee is displayed at checkout before you confirm your order.</p>
              </div>
              <div className="mt-5">
                <Button to="/shop" size="sm">Order Now</Button>
              </div>
            </div>

            {/* Pickup Option */}
            <div className="mt-8 rounded-xl2 border border-lilac-soft bg-white p-6 shadow-soft">
              <h3 className="font-heading text-lg font-bold text-ink">Pickup Option</h3>
              <p className="mt-2 text-sm text-ink-muted">
                Prefer to collect your order? Choose the Pickup option at checkout. 
                We will confirm your pickup time and provide our address details. 
                Pickup orders have no delivery fee.
              </p>
            </div>
          </div>
        </PageContainer>
      </Section>
    </>
  )
}

import { useState, useEffect } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Button from '../../components/ui/Button.jsx'
import { apiGetSettings } from '../../utils/api.js'

const DEFAULT_FAQ_CATEGORIES = [
  {
    title: 'Orders',
    items: [
      { q: 'How do I place an order?', a: 'Browse our Shop Today page, select your treats, add them to your basket, and proceed to checkout. You can pay online via Paystack or choose bank transfer.' },
      { q: 'Can I modify my order after placing it?', a: 'Orders can be modified within 30 minutes of placement if they have not yet entered preparation. Please contact us immediately via WhatsApp or phone.' },
      { q: 'How do I track my order?', a: 'Log into your Bamzy account, go to My Bamzy, and click on My Orders. You will see real-time status updates from order received to delivered.' },
    ],
  },
  {
    title: 'Payments',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept debit cards, bank transfers, and USSD payments through Paystack. All online payments are secured and encrypted.' },
      { q: 'Is my payment information safe?', a: 'Yes. We use Paystack, a PCI-compliant payment processor. We never store your card details on our servers.' },
      { q: 'What if my payment fails?', a: 'If your payment fails, your order remains saved. You can retry payment from your order details page. No charges will be made for failed transactions.' },
    ],
  },
  {
    title: 'Delivery & Pickup',
    items: [
      { q: 'Do you deliver?', a: 'Yes, we deliver across Southwest Nigeria! This includes Ibadan, Lagos, Ogun, Ondo, Ekiti, and Osun states. Delivery fees are calculated at checkout based on your location.' },
      { q: 'Can I pick up my order?', a: 'Yes, you can choose the Pickup option at checkout. We will confirm your pickup time and location details via phone.' },
      { q: 'What areas do you deliver to?', a: 'We deliver across Southwest Nigeria, including Ibadan, Lagos, Ogun, Ondo, Ekiti, and Osun states. Delivery fees are calculated at checkout based on your specific location.' },
    ],
  },
  {
    title: 'Custom Cakes',
    items: [
      { q: 'How far in advance should I order a custom cake?', a: 'We recommend ordering custom cakes at least 48-72 hours in advance. Wedding and large event cakes require 1-2 weeks notice.' },
      { q: 'Can I request a specific design?', a: 'Absolutely! Share your design inspiration and we will work with you to create the perfect cake. Final pricing depends on design complexity and size.' },
    ],
  },
  {
    title: 'Events & Catering',
    items: [
      { q: 'What events do you cater?', a: 'We cater birthdays, weddings, bridal showers, baby showers, corporate events, private celebrations, and more.' },
      { q: 'How do I book event catering?', a: 'Visit our Events & Bookings page and fill out the booking form. Our team will review your request and provide a custom quote within 24 hours.' },
    ],
  },
  {
    title: 'Trainings',
    items: [
      { q: 'What training classes do you offer?', a: 'We offer Cake Decorating, Baking Basics, Small Chops & Finger Foods, and advanced pastry classes.' },
      { q: 'How do I register for a training?', a: 'Visit our Trainings page, select a class, and complete the registration form. Payment can be made online via Paystack.' },
      { q: 'Do I need experience?', a: 'No prior experience is needed for our beginner classes. Advanced classes may require basic baking knowledge.' },
    ],
  },
]

function FaqItem({ q, a }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-b border-lilac-soft/60 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-ink">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-ink-muted transition-transform duration-200 ${isOpen ? 'rotate-180 text-pink' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed text-ink-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [categories, setCategories] = useState(DEFAULT_FAQ_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState(0)

  useEffect(() => {
    apiGetSettings().then((settings) => {
      if (Array.isArray(settings?.faq_categories) && settings.faq_categories.length > 0) {
        setCategories(settings.faq_categories)
      }
    }).catch(() => {})
  }, [])

  return (
    <>
      <Section background="gradient" className="py-10 sm:py-14">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-pink">
              <HelpCircle size={14} />
              Help Centre
            </span>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">Frequently Asked Questions</h1>
            <p className="mt-3 text-ink-muted">Everything you need to know about ordering, delivery, events and more.</p>
          </div>
        </PageContainer>
      </Section>

      <Section>
        <PageContainer>
          <div className="mx-auto max-w-3xl">
            {/* Category tabs */}
            <div className="mb-8 flex flex-wrap gap-2">
              {categories.map((cat, i) => (
                <button
                  key={cat.title}
                  onClick={() => setActiveCategory(i)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    activeCategory === i
                      ? 'bg-brand-gradient text-white shadow-card'
                      : 'border border-lilac-soft bg-white text-ink-muted hover:border-lilac hover:text-ink'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* FAQ items */}
            <div className="rounded-xl2 border border-lilac-soft bg-white shadow-soft">
              <div className="divide-y-0 px-6">
                {categories[activeCategory]?.items?.map((item, i) => (
                  <FaqItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>

            {/* Still have questions */}
            <div className="mt-12 rounded-xl2 border border-lilac-soft bg-brand-gradient-soft p-8 text-center">
              <h3 className="font-heading text-xl font-bold text-ink">Still have questions?</h3>
              <p className="mt-2 text-sm text-ink-muted">Can&apos;t find the answer you&apos;re looking for? Reach out to our team.</p>
              <div className="mt-5">
                <Button to="/contact" size="lg">Contact Us</Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </Section>
    </>
  )
}

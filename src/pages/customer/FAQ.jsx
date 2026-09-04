import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, HelpCircle, Search, MessageCircle, Phone, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import { apiGetSettings } from '../../utils/api.js'

const DEFAULT_FAQ_CATEGORIES = [
  {
    title: 'Orders',
    icon: '🧁',
    items: [
      { q: 'How do I place an order?', a: 'Browse our Shop Today page, select your treats, add them to your basket, and proceed to checkout. You can pay online via Paystack or choose bank transfer.' },
      { q: 'Can I modify my order after placing it?', a: 'Orders can be modified within 30 minutes of placement if they have not yet entered preparation. Please contact us immediately via WhatsApp or phone.' },
      { q: 'How do I track my order?', a: 'Log into your Bamzy account, go to My Bamzy, and click on My Orders. You will see real-time status updates from order received to delivered.' },
      { q: 'What if I receive the wrong order?', a: 'Contact us immediately via WhatsApp or phone. We will resolve it as quickly as possible, including a replacement or full refund.' },
    ],
  },
  {
    title: 'Payments',
    icon: '💳',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept debit cards, bank transfers, and USSD payments through Paystack. All online payments are secured and encrypted.' },
      { q: 'Is my payment information safe?', a: 'Yes. We use Paystack, a PCI-compliant payment processor. We never store your card details on our servers.' },
      { q: 'What if my payment fails?', a: 'If your payment fails, your order remains saved. You can retry payment from your order details page. No charges will be made for failed transactions.' },
      { q: 'Can I pay on delivery?', a: 'Currently we only accept online payment via Paystack or bank transfer before delivery. We are working on adding more payment options soon.' },
    ],
  },
  {
    title: 'Delivery & Pickup',
    icon: '🚚',
    items: [
      { q: 'Do you deliver?', a: 'Yes, we deliver across Southwest Nigeria! This includes Ibadan, Lagos, Ogun, Ondo, Ekiti, and Osun states. Delivery fees are calculated at checkout based on your location.' },
      { q: 'How long does delivery take?', a: 'Within Ibadan: 2-4 hours. Other Southwest states: 24-48 hours after order confirmation. You will receive updates at every stage.' },
      { q: 'Can I pick up my order?', a: 'Yes, you can choose the Pickup option at checkout. We will confirm your pickup time and location details via phone. Pickup has no delivery fee.' },
      { q: 'What areas do you deliver to?', a: 'We deliver across Southwest Nigeria — Ibadan, Lagos, Ogun, Ondo, Ekiti, and Osun states. Delivery fees are calculated at checkout based on your specific location.' },
    ],
  },
  {
    title: 'Custom Cakes',
    icon: '🎂',
    items: [
      { q: 'How far in advance should I order a custom cake?', a: 'We recommend ordering custom cakes at least 48-72 hours in advance. Wedding and large event cakes require 1-2 weeks notice.' },
      { q: 'Can I request a specific design?', a: 'Absolutely! Share your design inspiration and we will work with you to create the perfect cake. Final pricing depends on design complexity and size.' },
      { q: 'Do you deliver custom cakes?', a: 'Yes, custom cakes are carefully packaged and delivered with extra care. Delivery fees apply based on your location.' },
    ],
  },
  {
    title: 'Events & Catering',
    icon: '🎉',
    items: [
      { q: 'What events do you cater?', a: 'We cater birthdays, weddings, bridal showers, baby showers, corporate events, private celebrations, and more.' },
      { q: 'How do I book event catering?', a: 'Visit our Events & Bookings page and fill out the booking form. Our team will review your request and provide a custom quote within 24 hours.' },
      { q: 'What catering packages do you offer?', a: 'We offer flexible packages from dessert tables to full event catering. Contact us for a custom quote based on your guest count and menu preferences.' },
    ],
  },
  {
    title: 'Trainings',
    icon: '📚',
    items: [
      { q: 'What training classes do you offer?', a: 'We offer Cake Decorating, Baking Basics, Small Chops & Finger Foods, and advanced pastry classes.' },
      { q: 'How do I register for a training?', a: 'Visit our Trainings page, select a class, and complete the registration form. Payment can be made online via Paystack.' },
      { q: 'Do I need experience?', a: 'No prior experience is needed for our beginner classes. Advanced classes may require basic baking knowledge.' },
      { q: 'What is included in the training?', a: 'All materials, recipes, and a certificate of completion. You also get hands-on practice with our expert bakers.' },
    ],
  },
]

function FaqItem({ q, a, index }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-lilac-soft/60 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-4 py-5 text-left group"
      >
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
          isOpen ? 'bg-brand-gradient text-white' : 'bg-lilac-soft/50 text-lilac-deep group-hover:bg-lilac-soft'
        }`}>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
        <span className={`text-sm font-medium transition-colors ${isOpen ? 'text-pink' : 'text-ink group-hover:text-ink'}`}>
          {q}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-5 pl-12">
              <p className="text-sm leading-relaxed text-ink-muted">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const [categories, setCategories] = useState(DEFAULT_FAQ_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    apiGetSettings().then((settings) => {
      if (Array.isArray(settings?.faq_categories) && settings.faq_categories.length > 0) {
        setCategories(settings.faq_categories)
      }
    }).catch(() => {})
  }, [])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null
    const q = searchQuery.toLowerCase()
    const results = []
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)) {
          results.push({ ...item, category: cat.title, icon: cat.icon })
        }
      })
    })
    return results
  }, [searchQuery, categories])

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
              <HelpCircle size={12} />
              Help Centre
            </span>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
              How Can We Help?
            </h1>
            <p className="mt-4 text-lg text-ink-muted">
              Find answers to common questions about orders, delivery, payments and more.
            </p>

            {/* Search */}
            <div className="mt-8 mx-auto max-w-md">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for answers..."
                  className="w-full rounded-2xl border border-lilac-soft bg-white py-3.5 pl-11 pr-4 text-sm text-ink shadow-xs transition-all placeholder:text-ink-light/60 focus:border-lilac focus:outline-none focus:ring-2 focus:ring-lilac/20 focus:shadow-soft"
                />
              </div>
            </div>
          </motion.div>
        </PageContainer>
      </Section>

      {/* Content */}
      <Section className="relative -mt-4">
        <PageContainer>
          <div className="mx-auto max-w-3xl">
            {/* Search Results */}
            {searchResults !== null && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-ink-muted">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <button onClick={() => setSearchQuery('')} className="text-sm font-medium text-pink hover:underline">
                    Clear search
                  </button>
                </div>
                {searchResults.length === 0 ? (
                  <div className="rounded-2xl border border-lilac-soft bg-white p-10 text-center">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="font-heading text-lg font-semibold text-ink">No results found</p>
                    <p className="mt-2 text-sm text-ink-muted">Try different keywords or browse categories below.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-lilac-soft bg-white shadow-xs overflow-hidden">
                    <div className="px-6">
                      {searchResults.map((item, i) => (
                        <FaqItem key={i} q={item.q} a={item.a} index={i} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Category Tabs */}
            {searchResults === null && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {categories.map((cat, i) => (
                      <button
                        key={cat.title}
                        onClick={() => setActiveCategory(i)}
                        className={`flex flex-col items-center gap-2 rounded-2xl p-3 sm:p-4 transition-all ${
                          activeCategory === i
                            ? 'bg-brand-gradient text-white shadow-card scale-105'
                            : 'border border-lilac-soft bg-white text-ink-muted hover:border-lilac hover:text-ink hover:shadow-soft'
                        }`}
                      >
                        <span className="text-xl">{cat.icon || '📋'}</span>
                        <span className="text-[11px] font-semibold leading-tight text-center">{cat.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* FAQ Items */}
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border border-lilac-soft bg-white shadow-xs overflow-hidden"
                >
                  <div className="px-6">
                    {categories[activeCategory]?.items?.map((item, i) => (
                      <FaqItem key={i} q={item.q} a={item.a} index={i} />
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 grid gap-4 sm:grid-cols-2"
            >
              <div className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-xs text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient-soft text-pink">
                  <MessageCircle size={20} />
                </div>
                <h3 className="font-heading text-lg font-bold text-ink">Chat on WhatsApp</h3>
                <p className="mt-1 text-sm text-ink-muted">Get instant replies from our team.</p>
                <a
                  href="https://wa.me/2347033374470?text=Hi%20Bamzy!%20I%20have%20a%20question."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-600 hover:shadow-lg"
                >
                  <MessageCircle size={16} />
                  Start Chat
                </a>
              </div>
              <div className="rounded-2xl border border-lilac-soft bg-white p-6 shadow-xs text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient-soft text-pink">
                  <Phone size={20} />
                </div>
                <h3 className="font-heading text-lg font-bold text-ink">Call Us</h3>
                <p className="mt-1 text-sm text-ink-muted">Mon-Sat, 8am-6pm WAT.</p>
                <a
                  href="tel:+2347033374470"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-lilac-soft bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:bg-lilac-soft hover:shadow-soft"
                >
                  <Phone size={16} />
                  +234 703 337 4470
                </a>
              </div>
            </motion.div>
          </div>
        </PageContainer>
      </Section>
    </>
  )
}

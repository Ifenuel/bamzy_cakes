import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'
import Button from '../../components/ui/Button.jsx'

const FAQ_CATEGORIES = [
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
      { q: 'Do you deliver?', a: 'Yes, we deliver across Southwest Nigeria! This includes Ibadan, Lagos, Ogun, Ondo, Ekiti, and Osun states. Delivery fees are calculated at checkout based on your location — within Ibadan is cheaper, while delivery to other Southwest states may vary. Delivery typically takes 2-4 hours within Ibadan and 24-48 hours for other Southwest locations.' },
      { q: 'Can I pick up my order?', a: 'Yes, you can choose the Pickup option at checkout. We will confirm your pickup time and location details via phone.' },
      { q: 'What areas do you deliver to?', a: 'We deliver across Southwest Nigeria, including Ibadan, Lagos, Ogun, Ondo, Ekiti, and Osun states. Delivery fees are calculated at checkout based on your specific location. Contact us if you need delivery outside our standard Southwest Nigeria zones.' },
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
      { q: 'Do you provide event setup?', a: 'Yes, we offer dessert table setup and event styling as part of our catering services. Let us know your requirements when booking.' },
    ],
  },
  {
    title: 'Trainings',
    items: [
      { q: 'Do I need experience to join a training class?', a: 'No! Our classes cater to all skill levels. We have beginner-friendly Baking Basics as well as advanced Cake Decorating classes.' },
      { q: 'What is included in the training fee?', a: 'Training fees include all ingredients, equipment use, hands-on instruction, and materials. You take home what you make.' },
      { q: 'Can I register for multiple people?', a: 'Yes, you can register multiple students at once. The fee is per person and spaces are limited, so book early.' },
    ],
  },
]

function AccordionItem({ q, a, isOpen, onClick }) {
  return (
    <div className="border-b border-lilac-soft/60">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-pink"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-ink sm:text-base">{q}</span>
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
  const [openCategory, setOpenCategory] = useState(0)
  const [openQuestions, setOpenQuestions] = useState({})

  function toggleQuestion(catIdx, qIdx) {
    const key = `${catIdx}-${qIdx}`
    setOpenQuestions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      <Section background="gradient" className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <PageContainer>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-pink shadow-soft">
              <HelpCircle size={24} />
            </span>
            <div>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">Frequently Asked Questions</h1>
              <p className="mt-1 text-ink-muted">Everything you need to know about ordering with Bamzy.</p>
            </div>
          </div>
        </PageContainer>
      </Section>

      <Section className="pt-8 pb-14 sm:pt-10 sm:pb-20">
        <PageContainer>
          <div className="mx-auto max-w-3xl">
            {/* Category Tabs */}
            <div className="mb-8 flex flex-wrap gap-2">
              {FAQ_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.title}
                  onClick={() => setOpenCategory(i)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    openCategory === i
                      ? 'bg-brand-gradient text-white shadow-sm'
                      : 'border border-lilac-soft text-ink-muted hover:border-lilac hover:text-ink'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="rounded-xl2 border border-lilac-soft bg-white p-6 shadow-soft sm:p-8">
              <h2 className="mb-4 font-heading text-xl font-bold text-ink">
                {FAQ_CATEGORIES[openCategory].title}
              </h2>
              {FAQ_CATEGORIES[openCategory].items.map((item, qIdx) => (
                <AccordionItem
                  key={qIdx}
                  q={item.q}
                  a={item.a}
                  isOpen={!!openQuestions[`${openCategory}-${qIdx}`]}
                  onClick={() => toggleQuestion(openCategory, qIdx)}
                />
              ))}
            </div>

            {/* Still Have Questions */}
            <div className="mt-10 rounded-xl2 border border-lilac-soft bg-brand-gradient-soft p-8 text-center">
              <h3 className="font-heading text-xl font-bold text-ink">Still have questions?</h3>
              <p className="mt-2 text-sm text-ink-muted">
                Our team is happy to help. Reach out and we will get back to you promptly.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button to="/contact" size="sm">Contact Us</Button>
                <a
                  href="https://wa.me/2347033374470"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-lilac-soft bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-pink hover:text-pink"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </PageContainer>
      </Section>
    </>
  )
}
